import { Form } from "./form";

/** The type of primitive components that can be used */
export type ComponentType =
  | 'color'
  | 'checkbox'
  | 'date'
  | 'date'
  | 'email'
  | 'kanban'
  | 'number'
  | 'paragraph'
  | 'radio'
  | 'select'
  | 'span'
  | 'switch'
  | 'tag' // TODO, e.g. for string arrays
  | 'text'
  | 'textarea'
  | 'time'
  | 'url';

export const isComponentType = <T>(x?: ComponentType | Form<T[Extract<keyof T, string>]>): x is ComponentType =>
  typeof x === 'string';
