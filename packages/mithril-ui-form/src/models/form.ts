import { IInputField } from './input-field';

/** A form with one or more input fields or forms (to allow for nested objects) */
export type Form<T> = {
  [K in Extract<keyof T, string>]?: IInputField<T> | Form<T[K]>;
};
