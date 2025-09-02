import { UIForm, InputField, ComponentType } from 'mithril-ui-form-plugin';

export const capitalizeFirstLetter = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const isComponentType = (x?: ComponentType | UIForm): x is ComponentType => typeof x === 'string';

/**
 * Pad the string with padding character.
 * @param str Input string or number
 * @param length Desired length, @default 2
 * @param padding Padding character, @default '0'
 */
export const padLeft = (str: string | number, length = 2, padding = '0'): string =>
  str.toString().length >= length ? str.toString() : padLeft(padding + str, length, padding);

export const toHourMin = (d?: Date) => (d ? `${padLeft(d.getHours())}:${padLeft(d.getMinutes())}` : '00:00');

/**
 * Retreive a value from an object using a dynamic path.
 * If the attribute does not exist, return undefined.
 * @param obj - The object to search in
 * @param path - The path to traverse, e.g. a.b[0].c
 * @returns The value at the given path or undefined
 * @see https://stackoverflow.com/a/6491621/319711
 */
export const getPath = <O extends Record<string, any>>(obj: O, path: string): any => {
  // Early return for empty or invalid inputs
  if (!obj || !path) return undefined;

  // Optimize path parsing
  const keys = path
    .replace(/\[(\w+)\]/g, '.$1') // Convert array bracket notation
    .replace(/^\./, '') // Remove leading dot
    .split('.');

  // Use reduce for more efficient traversal with type-safe access
  return keys.reduce((current, key) => {
    // Handle undefined/null values early
    if (current == null) return undefined;

    // Specific handling for arrays with potential object matching
    if (Array.isArray(current)) {
      // Check for ID-based object lookup
      const m = /([A-Z]\w+)/.exec(key);
      if (m) {
        const matchKey = m[0][0].toLowerCase() + m[0].substr(1) || key;
        return current.find(
          (item) => typeof item === 'object' && item !== null && matchKey in item && item[matchKey] === key
        );
      }

      // Standard array index access
      return current[parseInt(key, 10)];
    }

    // Type-safe object property access
    return typeof current === 'object' && current !== null && key in current
      ? current[key as keyof typeof current]
      : undefined;
  }, obj);
};

export const flatten = <T>(arr: T[]) =>
  arr.reduce((acc, cur) => (cur instanceof Array ? [...acc, ...cur] : [...acc, cur]), [] as T[]);

// const isSet = (a: any) =>
//   typeof a === 'undefined' ? false : typeof a === 'boolean' ? a : typeof +a === 'number' ? +a !== 0 : true;

const expressionRegex = /([^ =><!]*)\s*([=><!]*)\s*(\S*)/i;
const invertExpression = /^\s*!\s*/;

const checkExpression = <O>(expression: string, obj: O) => {
  if (!obj || Object.keys(obj).length === 0) {
    return false;
  }
  const match = expressionRegex.exec(expression);
  if (match) {
    const [fullMatch, path, operand, matchValue] = match;
    // console.table([{ fullMatch, path, operand, matchValue }]);
    const v = getPath(obj, path.trim());
    if (typeof v === 'undefined' || (typeof v === 'string' && v.length === 0)) {
      return false;
    } else if (operand && matchValue) {
      const val = isNaN(+matchValue)
        ? matchValue === 'true'
          ? true
          : matchValue === 'false'
          ? false
          : matchValue
        : +matchValue;
      switch (operand) {
        case '=':
        case '==':
        case '===':
          return v instanceof Array ? v.indexOf(val) >= 0 : v === val;
        case '!=':
        case '!==':
          return v instanceof Array ? v.indexOf(val) >= 0 : v !== val;
        case '<=':
          return v <= val;
        case '>=':
          return v >= val;
        case '<':
          return v < val;
        case '>':
          return v > val;
        default:
          console.error(`Unrecognized operand (${operand}) in expression: ${fullMatch}`);
          return false;
      }
    } else {
      return true;
    }
  }
  return true;
};

const checkExpressions = <O>(expression: string, flattened: O[]) => {
  const ands = expression.split(/&|;/).map((e) => e.trim());
  // console.log(`expression: ${expression}, ANDS: ${ands.join(';')}`);
  // console.log(`INVERT EXPRESSION: ${invertExpression}`)
  return ands.reduce((acc, expr) => {
    const invert = invertExpression.test(expr);
    // console.log(`AND: ${ands}, INVERT: ${invert}`);
    const e = invert ? expr.replace(invertExpression, '') : expr;
    acc = acc && flattened.filter(Boolean).reduce((p, obj) => p || checkExpression(e.trim(), obj), false as boolean);
    return invert ? !acc : acc;
  }, true);
};

/** Check if we are looking for a strict equal, e.g. == or ===, or if no comparison is needed and we just want the value to be defined. */
const strictEqualOrNoComparison = /===?|[^<>=]/i;

export const evalExpression = <O = {}>(expression: string | string[], ...objArr: Array<Partial<O> | O[keyof O]>) => {
  const expr = expression instanceof Array ? expression : [expression];
  if (expression.length === 0) return true;
  return expr.some((e) => checkExpressions(e, strictEqualOrNoComparison.test(e) ? [objArr[0]] : flatten(objArr)));
};

/** Finds the key in the object array and returns the value */
export const resolveExpression = <O extends {}>(expression: string, objArr: O[]) =>
  getPath(
    objArr.filter(Boolean).reduceRight((acc, obj) => ({ ...obj, ...acc })),
    expression.trim()
  );

const canResolveExpression = <O>(expression: string, objArr: Array<Partial<O> | O[keyof O]>) =>
  typeof resolveExpression(expression, objArr as any) !== 'undefined';

const placeholderRegex = /{{\s*([^\s"'`:]*):?([^\s]*)\s*}}/g;

/** Can the placeholders be resolved by the object, i.e. do we have a match in the active object or its context. */
export const canResolvePlaceholders = <O>(str: string, ...objArr: Array<Partial<O> | O[keyof O]>) => {
  if (!placeholderRegex.test(str)) {
    return true;
  }
  placeholderRegex.lastIndex = 0; // reset index, otherwise no match will occur for global regex.

  let m: RegExpExecArray | null;
  let canResolve = true;

  do {
    m = placeholderRegex.exec(str);
    if (m) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === placeholderRegex.lastIndex) {
        placeholderRegex.lastIndex++;
      }

      m.forEach((_, __, [, expression]) => {
        canResolve = canResolve && canResolveExpression(expression, objArr);
      });
    }
  } while (canResolve && m !== null);
  return canResolve;
};

/**
 * A placeholder optionally needs to be converted, e.g. a number to a date string.
 * Supported formatters are: date, time, iso, utc and A:B for booleans.
 * In the latter case, A is returned when true, B otherwise.
 */
export const formatExpression = (
  value?: string | number | boolean | Date | Array<string | number>,
  exprType?: 'date' | 'time' | 'iso' | 'utc' | string
): string => {
  if (typeof value === 'undefined') {
    return '';
  }
  if (value instanceof Array) {
    return value.map((v) => formatExpression(v, exprType)).join(', ');
  }
  if (!exprType) {
    return value.toString();
  }
  if (typeof value === 'boolean') {
    const i = exprType.indexOf(':');
    return value ? exprType.substring(0, i) : exprType.substring(i + 1);
  }
  switch (exprType) {
    default:
      return value.toString();
    case 'date':
      return new Date(value).toLocaleDateString();
    case 'time':
      return new Date(value).toLocaleTimeString();
    case 'iso':
      return new Date(value).toISOString();
    case 'utc':
      return new Date(value).toUTCString();
  }
};

/** Replace the placeholder with the appropriate value. */
export const resolvePlaceholders = <O>(str: string, ...objArr: Array<Partial<O> | O[keyof O]>) =>
  str.replace(placeholderRegex, (fullMatch, expression, exprType) => {
    const resolved = resolveExpression(expression.trim(), objArr as any);
    if (resolved && !(resolved instanceof Array)) {
      return formatExpression(resolved, exprType);
    }
    return fullMatch;
  });

/**
 * Deep copy function for TypeScript.
 * @param target - Target value to be copied.
 * @returns Deep copy of the target value
 * @see Source project, ts-deepcopy https://github.com/ykdr2017/ts-deepcopy
 * @see Code pen https://codepen.io/erikvullings/pen/ejyBYg
 */
export const deepCopy = <T>(target: T): T => {
  if (target === null) {
    return target;
  }
  if (target instanceof Date) {
    return new Date(target.getTime()) as any;
  }
  if (target instanceof Array) {
    const cpy = [] as any[];
    (target as any[]).forEach((v) => {
      cpy.push(v);
    });
    return cpy.map((n: any) => deepCopy<any>(n)) as any;
  }
  if (typeof target === 'object') {
    const cpy = { ...(target as { [key: string]: any }) } as {
      [key: string]: any;
    };
    Object.keys(cpy).forEach((k) => {
      cpy[k] = deepCopy<any>(cpy[k]);
    });
    return cpy as T;
  }
  return target;
};

/**
 * Create a resolver that translates an ID and value (or values) to a human readable representation
 * by replacing the keys with their form labels, making it easier to render the object into a human
 * readable form.
 */
export const labelResolver = <O extends Record<string, any>>(form: UIForm<O>) => {
  const createDict = (ff: UIForm<O | O[keyof O]>, label = '') => {
    const d = ff
      .filter((f) => f.type !== 'section' && f.type !== 'md')
      .reduce((acc, cur) => {
        const fieldId = (label ? `${label}.` : '') + String(cur.id);
        const type = cur.type || (cur.options && cur.options.length > 0 ? 'select' : 'text');
        if (typeof type === 'string') {
          acc[fieldId] = cur;
        } else {
          acc = { ...acc, ...createDict(type as UIForm<O | O[keyof O]>, fieldId) };
        }
        return acc;
      }, {} as { [key: string]: InputField<O> });
    return d;
  };

  const dict = createDict(form);

  const resolver = (id: string, value?: number | string | string[]) => {
    if (!dict.hasOwnProperty(id) || typeof value === 'undefined') {
      return value;
    }
    const ff = dict[id];
    const values = value instanceof Array ? value.filter((v) => v !== null && v !== undefined) : [value];
    const type = ff.type || (ff.options ? 'options' : 'none');
    switch (type) {
      default:
        return value;
      case 'radio':
      case 'select':
      case 'options':
        const opt =
          typeof ff.options === 'string'
            ? (resolveExpression(ff.options, [dict]) as Array<{
                id: string;
                label?: string | undefined;
              }>)
            : ff.options;
        return values
          .map((v) =>
            opt!
              .filter((o) => {
                // Handle string options
                if (typeof o === 'string') {
                  return o === v;
                }
                // Handle object options
                return o.id === v;
              })
              .map((o) => {
                // Handle string options
                if (typeof o === 'string') {
                  return capitalizeFirstLetter(o);
                }
                // Handle object options
                return o.label || capitalizeFirstLetter(o.id);
              })
              .shift()
          )
          .filter((v) => typeof v !== 'undefined');
    }
  };

  /** Resolve an object by replacing all keys with their label counterpart. */
  const resolveObj = <T>(obj: any, parent = ''): T | undefined => {
    if (!obj || (typeof obj === 'object' && Object.keys(obj).length === 0)) {
      return undefined;
    }
    if (obj instanceof Array) {
      return obj.map((o) => resolveObj(o, parent)) as any;
    } else {
      const resolved = {} as { [key: string]: any };
      Object.keys(obj).forEach((key) => {
        const fullKey = parent ? `${parent}.${key}` : key;
        const value = obj[key as keyof T];
        if (typeof value === 'boolean') {
          resolved[key] = value;
        } else if (typeof value === 'number' || typeof value === 'string') {
          const r = resolver(fullKey, value);
          if (r) {
            resolved[key] = r instanceof Array && r.length === 1 ? r[0] : r;
          }
        } else if (value instanceof Array) {
          if (typeof value[0] === 'string' || value[0] === null) {
            const r = resolver(fullKey, value);
            if (r) {
              resolved[key] = r;
            }
          } else {
            resolved[key] = resolveObj(value, key);
          }
        } else if (typeof value === 'object') {
          resolved[key] = value;
        }
      });
      return resolved as T;
    }
  };

  return resolveObj;
};

/** Remove all spaces, dots and commas from a string, and turn to lower case */
export const stripSpaces = (s = '') => s.replace(/\s|,|\./g, '').toLowerCase();

/**
 * Generate a sequence of numbers between from and to with step size: [from, to].
 *
 * @param from - Starting number
 * @param to - Ending number (inclusive)
 * @param step - Step size (default: 1)
 * @returns Array of numbers
 */
export const range = (from: number, to: number, step: number = 1) => {
  const arr = [] as number[];
  for (let i = from; i <= to; i += step) {
    arr.push(i);
  }
  return arr;
};

/** Create a hash for use in keys */
export const hash = (s: string | { [key: string]: any }) => {
  if (typeof s !== 'string') {
    s = JSON.stringify(s);
  }
  let hash = 0;
  if (s.length === 0) {
    return hash;
  }
  for (var i = 0; i < s.length; i++) {
    var char = s.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
};

/** Create a new URL fragment (i.e. without the domain/port) by merging base parameters with overriding parameters */
export const toQueryString = (
  fragment: string,
  baseParams: Record<string, any>,
  overrideParams: Record<string, any>
) => {
  const mergedObj = Object.assign({}, baseParams, overrideParams);
  return `${fragment}?${Object.keys(mergedObj)
    .map((key) => `${key}=${mergedObj[key]}`)
    .join('&')}`;
};

/** Extract all query parameters to an object */
export const getAllUrlParams = (url: string) => {
  // get query string from url (optional) or window
  const queryString = url ? url.split('?')[1] : window.location.search.slice(1);

  // we'll store the parameters here
  const result = {} as Record<string, string | boolean | string[]>;

  // if query string exists
  if (queryString) {
    // split our query string into its component parts
    const arr = queryString.split('&');

    for (var i = 0; i < arr.length; i++) {
      // separate the keys and the values
      const a = arr[i].split('=');

      // set parameter name and value (use 'true' if empty)
      const paramName = a[0];
      const paramValue = typeof a[1] === 'undefined' ? true : a[1];

      // if the paramName ends with square brackets, e.g. colors[] or colors[2]
      if (paramName.match(/\[(\d+)?\]$/)) {
        // create key if it doesn't exist
        const key = paramName.replace(/\[(\d+)?\]/, '');
        const arr = (result[key] || []) as Array<string | boolean>;

        // if it's an indexed array e.g. colors[2]
        if (paramName.match(/\[\d+\]$/)) {
          // get the index value and add the entry at the appropriate position
          const index = +/\[(\d+)\]/.exec(paramName)![1];
          arr[index] = paramValue;
        } else {
          // otherwise add the value to the end of the array
          arr.push(paramValue);
        }
      } else {
        // we're dealing with a string or true
        if (!result[paramName]) {
          // if it doesn't exist, create property
          result[paramName] = paramValue;
        } else if (typeof result[paramName] === 'string') {
          // if property does exist and it's a string, convert it to an array
          result[paramName] = [result[paramName] as string];
          (result[paramName] as string[]).push(paramValue as string);
        } else {
          // otherwise add the property
          (result[paramName] as string[]).push(paramValue as string);
        }
      }
    }
  }

  return result;
};

export const getQueryParamById = (paramId: string): string | null => {
  const queryString = window.location.hash.split('?')[1]; // Extract everything after the '?' in the fragment identifier
  if (queryString) {
    const queryParams = new URLSearchParams(queryString);
    return queryParams.get(paramId);
  }
  return null;
};

export const extractTitle = (param: unknown): string | undefined => {
  // Check if the parameter is an object and not null
  if (param !== null && typeof param === 'object') {
    // Check for title, label, alt, or name properties
    const possibleTitleProps = ['title', 'label', 'alt', 'name'];

    for (const prop of possibleTitleProps) {
      if (prop in param && typeof (param as Record<string, unknown>)[prop] === 'string') {
        return (param as Record<string, unknown>)[prop] as string;
      }
    }
  }

  // Return undefined if no matching property is found
  return undefined;
};

// Array manipulation utilities for ArrayLayoutForm
export const arrayUtils = {
  /**
   * Move an item from one index to another in an array
   */
  moveItem: <T>(array: T[], fromIndex: number, toIndex: number): T[] => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= array.length || toIndex >= array.length) {
      return array;
    }
    
    const newArray = [...array];
    const [movedItem] = newArray.splice(fromIndex, 1);
    newArray.splice(toIndex, 0, movedItem);
    return newArray;
  },

  /**
   * Insert an item at a specific index
   */
  insertAt: <T>(array: T[], index: number, item: T): T[] => {
    const newArray = [...array];
    newArray.splice(index, 0, item);
    return newArray;
  },

  /**
   * Remove an item at a specific index
   */
  removeAt: <T>(array: T[], index: number): T[] => {
    if (index < 0 || index >= array.length) {
      return array;
    }
    const newArray = [...array];
    newArray.splice(index, 1);
    return newArray;
  },

  /**
   * Swap two items in an array
   */
  swap: <T>(array: T[], index1: number, index2: number): T[] => {
    if (index1 === index2 || index1 < 0 || index2 < 0 || index1 >= array.length || index2 >= array.length) {
      return array;
    }
    
    const newArray = [...array];
    [newArray[index1], newArray[index2]] = [newArray[index2], newArray[index1]];
    return newArray;
  },

  /**
   * Duplicate an item at a specific index
   */
  duplicate: <T>(array: T[], index: number): T[] => {
    if (index < 0 || index >= array.length) {
      return array;
    }
    
    const item = array[index];
    const duplicatedItem = typeof item === 'object' ? deepCopy(item) : item;
    return arrayUtils.insertAt(array, index + 1, duplicatedItem);
  },

  /**
   * Check if an array is valid according to min/max constraints
   */
  isValidArray: <T>(array: T[], min = 0, max?: number): boolean => {
    return array.length >= min && (max === undefined || array.length <= max);
  }
};
