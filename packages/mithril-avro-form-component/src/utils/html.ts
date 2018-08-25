import m, { Lifecycle } from 'mithril';

export const compose = <F extends (d: any) => any, T>(...functions: F[]) => (data: T) =>
  functions.reduceRight((value, func) => func(value), data);

export const map = <T>(f: (...args: any[]) => any) => (x: T[]) => Array.prototype.map.call(x, f);

export const join = <T>(seperator: string) => (list: T[]): string => Array.prototype.join.call(list, seperator);

/**
 * Convert camel case to snake case.
 *
 * @param {string} cc: Camel case string
 */
export const camelToSnake = (cc: string) => cc.replace(/([A-Z])/g, ($1) => '-' + $1.toLowerCase());

const encodeAttribute = (x = '') => x.toString().replace(/"/g, '&quot;');

const toAttributeString = <T extends { [key: string]: any }>(x?: T) =>
  x
    ? compose(
        join(''),
        map((attribute: string) => `[${camelToSnake(attribute)}="${encodeAttribute(x[attribute])}"]`),
        Object.keys
      )(x)
    : '';

export interface IHtmlAttributes {
  id?: string;
  for?: string;
  placeholder?: string;
  autofocus?: boolean;
  disabled?: boolean;
  type?: 'submit' | 'button' | 'text' | 'textarea' | 'number';
}

export interface IHtmlInputEvents<State, Attrs> extends Lifecycle<Attrs, State> {
  value?: string | number | boolean;
  href?: string;
  class?: string;
  style?: string;
  type?: string;
  onclick?: (e: UIEvent) => void;
}

export const icon = (iconName: string, attrs = {}) => m('i.material-icons', attrs, iconName);
export const smallIcon = (iconName: string, attrs = {}) => m('i.small.material-icons', attrs, iconName);

export const iconPrefix = (iconName: string, attrs = {}) => m('i.material-icons.prefix', attrs, iconName);

/**
 * Convert a list of class names to mithril syntax, e.g. .class1.class2.class3
 * @param classNames
 */
export const toDottedClassList = (classNames?: string | string[]) =>
  classNames instanceof Array && classNames.length > 0 ? '.' + classNames.join('.') : '';

const baseButton = (defaultClassNames: string[]) => <State, Attrs>(opt: {
  label?: string;
  iconName?: string;
  attr?: IHtmlAttributes;
  ui?: IHtmlInputEvents<State, Attrs>;
}) =>
  m(
    `${defaultClassNames.join('.')}${toAttributeString(opt.attr)}`,
    opt.ui || {},
    opt.iconName ? icon(opt.iconName) : '',
    opt.label ? opt.label : ''
  );

export const button = baseButton(['button', 'waves-effect', 'waves-light', 'btn']);
export const flatButton = baseButton(['button', 'waves-effect', 'waves-teal', 'btn-flat']);
export const roundIconButton = baseButton(['button', 'btn-floating', 'btn-large', 'waves-effect', 'waves-light']);

const inputField = (type: string) => (opt: {
  id: string;
  initialValue?: string;
  onchange: (value: string) => void;
  label: string;
  iconName?: string;
  style?: string;
  classNames?: string | string[];
}) =>
  m(
    `.input-field${toDottedClassList(opt.classNames)}`,
    { style: opt.style || '' },
    [
      opt.iconName ? m('i.material-icons.prefix', opt.iconName) : '',
      m(`${type}[id=${opt.id}]`, {
        oninput: m.withAttr('value', opt.onchange),
        value: opt.initialValue,
      }),
      m(`label${opt.initialValue ? '.active' : ''}[for=${opt.id}]`, opt.label),
    ]
  );

export const inputTextArea = inputField('textarea.materialize-textarea');
export const inputText = inputField('input[type=text]');
export const inputNumber = inputField('input[type=number]');
