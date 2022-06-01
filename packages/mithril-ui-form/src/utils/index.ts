import { UIForm, IInputField, ComponentType } from 'mithril-ui-form-plugin';

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
const getPath = (obj: Record<string, any>, s: string) => {
  s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
  s = s.replace(/^\./, ''); // strip a leading dot
  const a = s.split('.');
  let o = { ...obj };
  for (let i = 0, n = a.length; i < n; ++i) {
    const k = a[i];
    if (k in o) {
      o = o[k];
    } else if (o instanceof Array) {
      const id = obj[k] || k;
      const m = /([A-Z]\w+)/.exec(k); // categoryId => match Id, myNameLabel => NameLabel
      const key = (m && m[0][0].toLowerCase() + m[0].substr(1)) || k; // key = id or nameLabel
      const found = o.filter((i) => i[key] === id).shift();
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

const flatten = <T>(arr: T[]) =>
  arr.reduce((acc, cur) => (cur instanceof Array ? [...acc, ...cur] : [...acc, cur]), [] as T[]);

// const isSet = (a: any) =>
//   typeof a === 'undefined' ? false : typeof a === 'boolean' ? a : typeof +a === 'number' ? +a !== 0 : true;

const expressionRegex = /([^ =><]*)\s*([=><]*)\s*(\S*)/i;
const invertExpression = /^\s*!\s*/;

const checkExpression = (expression: string, obj: Record<string, any>) => {
  if (!obj || Object.keys(obj).length === 0) {
    return false;
  }
  const match = expressionRegex.exec(expression);
  if (match) {
    const [fullMatch, path, operand, matchValue] = match;
    const resolved = getPath(obj, path.trim());
    const v = typeof resolved === 'boolean' ? (resolved ? 'true' : 'false') : resolved;
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

const checkExpressions = (expression: string, objArr: Record<string, any>[]) => {
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

export const evalExpression = (expression: string | string[], ...objArr: Record<string, any>[]) => {
  const expr = expression instanceof Array ? expression : [expression];
  return expr.some((e) => checkExpressions(e, objArr));
};

export const resolveExpression = (expression: string, objArr: Record<string, any>[]) =>
  getPath(
    objArr.filter(Boolean).reduceRight((acc, obj) => ({ ...obj, ...acc })),
    expression.trim()
  );

const canResolveExpression = (expression: string, objArr: Record<string, any>[]) =>
  typeof resolveExpression(expression, objArr) !== 'undefined';

const placeholderRegex = /{{\s*([^\s"'`:]*):?([^\s]*)\s*}}/g;

/** Can the placeholders be resolved by the object, i.e. do we have a match in the active object or its context. */
export const canResolvePlaceholders = (str: string, ...objArr: Record<string, any>[]) => {
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
const formatExpression = (
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
export const resolvePlaceholders = (str: string, ...objArr: Record<string, any>[]) => {
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
        const resolved = resolveExpression(expression, objArr);
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
  if (typeof target === 'object' && target !== {}) {
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
export const labelResolver = (form: UIForm) => {
  const createDict = (ff: IInputField[], label = '') => {
    const d = ff
      .filter((f) => f.type !== 'section' && f.type !== 'md')
      .reduce((acc, cur) => {
        const fieldId = (label ? `${label}.` : '') + cur.id;
        const type = cur.type || (cur.options && cur.options.length > 0 ? 'select' : 'text');
        if (typeof type === 'string') {
          acc[fieldId] = cur;
        } else {
          acc = { ...acc, ...createDict(type, fieldId) };
        }
        return acc;
      }, {} as { [key: string]: IInputField });
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
