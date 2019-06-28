import { IObject } from '../models/object';

export const capitalizeFirstLetter = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

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
export const getPath = (o: IObject, s: string) => {
  s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
  s = s.replace(/^\./, ''); // strip a leading dot
  const a = s.split('.');
  for (let i = 0, n = a.length; i < n; ++i) {
    const k = a[i];
    if (k in o) {
      o = o[k];
    } else {
      return undefined;
    }
  }
  return o as any;
};

// const isSet = (a: any) =>
//   typeof a === 'undefined' ? false : typeof a === 'boolean' ? a : typeof +a === 'number' ? +a !== 0 : true;

const expressionRegex = /([^ =><]*)\s*([=><]*)\s*(\S*)/i;
const invertExpression = /^\s*!\s*/;

const checkExpression = (expression: string, obj: IObject) => {
  if (!obj || Object.keys(obj).length === 0) {
    return false;
  }
  const match = expressionRegex.exec(expression);
  if (match) {
    const [fullMatch, path, operand, value] = match;
    const v = getPath(obj, path.trim());
    if (typeof v === 'undefined' || (typeof v === 'string' && v.length === 0)) {
      return false;
    } else if (operand && value) {
      const val = !isNaN(+value) ? (+value ? value === 'true' : true ? value === 'false' : false) : value;
      switch (operand) {
        case '=':
          return v instanceof Array ? (v.indexOf(val) >= 0) : (v === val);
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

const checkExpressions = (expression: string, objArr: IObject[]) => {
  const ands = expression.split('&');
  return ands.reduce((acc, expr) => {
    const invert = invertExpression.test(expr);
    const e = invert ? expr.replace(invertExpression, '') : expr;
    acc = acc && objArr.reduce((p, obj) => p || checkExpression(e.trim(), obj), false as boolean);
    return invert ? !acc : acc;
  }, true);
};

export const evalExpression = (expression: string | string[], ...objArr: IObject[]) => {
  const expr = expression instanceof Array ? expression : [expression];
  return expr.some(e => checkExpressions(e, objArr));
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
    (target as any[]).forEach(v => {
      cpy.push(v);
    });
    return cpy.map((n: any) => deepCopy<any>(n)) as any;
  }
  if (typeof target === 'object' && target !== {}) {
    const cpy = { ...(target as { [key: string]: any }) } as {
      [key: string]: any;
    };
    Object.keys(cpy).forEach(k => {
      cpy[k] = deepCopy<any>(cpy[k]);
    });
    return cpy as T;
  }
  return target;
};
