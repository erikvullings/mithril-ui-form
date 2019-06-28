import { IInputField } from './input-field';

/** A form with one or more input fields or forms (to allow for nested objects) */
export type Form<T, C> = {
  [K in Extract<keyof T, string>]?: IInputField<T, C> | Form<T[K], C>;
};
