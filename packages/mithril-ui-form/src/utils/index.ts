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

export const toHourMin = (d: Date) => `${padLeft(d.getHours())}:${padLeft(d.getMinutes())}`;

/**
 * Retreive a value from an object using a dynamic path.
 * If the attribute does not exist, return undefined.
 * @param o: object
 * @param s: path, e.g. a.b[0].c
 * @see https://stackoverflow.com/a/6491621/319711
 */
export const getPath = <O extends {}>(obj: O, s: string) => {
  s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
  s = s.replace(/^\./, ''); // strip a leading dot
  const a = s.split('.');
  let o = { ...obj };
  for (let i = 0, n = a.length; i < n; ++i) {
    const k = a[i];
    if (typeof o === 'object' && k in o) {
      o = (o as Record<string, any>)[k];
      // a.length > 1 && console.table({ k, o, obj });
    } else if (o instanceof Array) {
      const id = (obj as any)[k] || k;
      const m = /([A-Z]\w+)/.exec(k); // categoryId => match Id, myNameLabel => NameLabel
      const key = (m && m[0][0].toLowerCase() + m[0].substr(1)) || k; // key = id or nameLabel
      const found = o.filter((i) => i[key] === id).shift();
      // a.length > 1 && console.table({ k, o, obj, id, m, key, found });
      if (found) {
        o = found;
      } else {
        return undefined;
      }
    } else {
      return undefined;
    }
  }
  return o as any;
};

export const flatten = <T>(arr: T[]) =>
  arr.reduce((acc, cur) => (cur instanceof Array ? [...acc, ...cur] : [...acc, cur]), [] as T[]);

// const isSet = (a: any) =>
//   typeof a === 'undefined' ? false : typeof a === 'boolean' ? a : typeof +a === 'number' ? +a !== 0 : true;

const expressionRegex = /([^ =><]*)\s*([=><]*)\s*(\S*)/i;
const invertExpression = /^\s*!\s*/;

const checkExpression = <O>(expression: string, obj: O) => {
  if (!obj || Object.keys(obj).length === 0) {
    return false;
  }
  const match = expressionRegex.exec(expression);
  if (match) {
    const [fullMatch, path, operand, matchValue] = match;
    const v = getPath(obj, path.trim());
    // const v = typeof resolved === 'boolean' ? (resolved ? 'true' : 'false') : resolved;
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
          return v instanceof Array ? v.indexOf(val) >= 0 : v === val;
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

const checkExpressions = <O>(expression: string, objArr: O[]) => {
  const ands = expression.split('&');
  // console.log(`ANDS: ${ands}`);
  const flattened = flatten(objArr);
  return ands.reduce((acc, expr) => {
    const invert = invertExpression.test(expr);
    // console.log(`INVERT: ${invert}`);
    const e = invert ? expr.replace(invertExpression, '') : expr;
    acc = acc && flattened.filter(Boolean).reduce((p, obj) => p || checkExpression(e.trim(), obj), false as boolean);
    return invert ? !acc : acc;
  }, true);
};

export const evalExpression = <O>(expression: string | string[], ...objArr: Array<Partial<O> | O[keyof O]>) => {
  const expr = expression instanceof Array ? expression : [expression];
  if (expression.length === 0) return true;
  return expr.some((e) => checkExpressions(e, objArr));
};

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
export const resolvePlaceholders = <O>(str: string, ...objArr: Array<Partial<O> | O[keyof O]>) => {
  if (!placeholderRegex.test(str)) {
    return str;
  }
  placeholderRegex.lastIndex = 0; // reset index, otherwise no match will occur for global regex.

  let m: RegExpExecArray | null;

  do {
    m = placeholderRegex.exec(str);
    if (m) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === placeholderRegex.lastIndex) {
        placeholderRegex.lastIndex++;
      }

      // The result can be accessed through the `m`-variable.
      m.forEach((_, __, [fullMatch, expression, exprType]) => {
        const resolved = resolveExpression(expression, objArr as any);
        if (resolved && !(resolved instanceof Array)) {
          str = str.replace(fullMatch, formatExpression(resolved, exprType));
        }
      });
    }
  } while (m !== null);
  return str;
};

/**
 * Deep copy function for TypeScript.
 * @param T Generic type of target/copied value.
 * @param target Target value to be copied.
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
              .filter((o) => o.id === v)
              .map((o) => o.label || capitalizeFirstLetter(o.id))
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
 * @static
 * @param {number} from
 * @param {number} to : inclusive
 * @param {number} [step=1]
 * @returns
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
