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
  let result = false;
  // let invertAnswer = false;
  if (match) {
    const [, path, operand, value] = match;
    // match.forEach((_, __, [___, invert, path, operand, value]) => {
    const v = getPath(obj, path.trim());
    // invertAnswer = invert ? true : false;
    if (typeof v === 'undefined') {
      result = false;
      // return;
    } else if (operand && value) {
      const val = !isNaN(+value) ? (+value ? value === 'true' : true ? value === 'false' : false) : value;
      switch (operand) {
        case '=':
          v instanceof Array ? (result = v.indexOf(val) >= 0) : (result = v === val);
          break;
        case '<=':
          result = v <= val;
          break;
        case '>=':
          result = v >= val;
          break;
        default:
          result = false;
          break;
      }
    } else {
      result = true;
      // return;
    }
    // });
  }
  return result;
  // return invertAnswer ? result : !result;
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
