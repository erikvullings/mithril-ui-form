import { Form } from './form';

/** The type of primitive components that can be used */
export type ComponentType =
  | 'autogenerate'
  | 'color'
  | 'checkbox'
  | 'date'
  | 'date'
  | 'email'
  | 'none' // Displays nothing, e.g. for autogenerated fields
  | 'number'
  | 'paragraph'
  | 'radio'
  | 'select'
  | 'span'
  | 'switch'
  | 'tags' // TODO, e.g. for string arrays
  | 'text'
  | 'textarea'
  | 'time'
  | 'url';

export const isComponentType = <T, C>(x?: ComponentType | Form<T[Extract<keyof T, string>], C>): x is ComponentType =>
  typeof x === 'string';
