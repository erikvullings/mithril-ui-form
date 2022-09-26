import { IInputField } from './input-field';

/** A form with one or more input fields or forms (to allow for nested objects) */
export type UIForm<O extends Record<string, any> = {}, K extends keyof O = keyof O> = IInputField<O, K>[];
