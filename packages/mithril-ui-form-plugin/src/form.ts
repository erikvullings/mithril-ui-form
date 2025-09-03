import { Attributes } from 'mithril';
import { I18n } from './i18n';
import { InputField } from './input-field';
import { ComponentType } from './component-type';

export type Option = {
  id: string | number;
  label: string;
  title?: string | undefined;
  disabled?: boolean | undefined;
  img?: string | undefined;
  group?: string | undefined;
  className?: string | undefined;
  description?: string | undefined;
  icon?: string;
  show?: string | string[];
};

/**
 * **Core Types**
 * @category Core Types
 */

/**
 * Represents the contextual data available when rendering form fields.
 *
 * The form context provides access to the current object being edited as well as
 * any parent or sibling objects that may be relevant for field visibility conditions,
 * validation, or data transformation.
 *
 * @template O - The type of the form object
 *
 * @example
 * ```typescript
 * interface User {
 *   name: string;
 *   email: string;
 *   profile: {
 *     bio: string;
 *   };
 * }
 *
 * // Context might include the user object and parent objects
 * const context: FormContext<User> = [
 *   currentUser,           // The main object being edited
 *   parentData,            // Parent context (if editing nested object)
 *   'email'                // Field-level context
 * ];
 * ```
 */
export type FormContext<O extends object> = Array<Partial<O> | O[keyof O] | { [key: string]: Option }>;

/**
 * Attributes interface for form components in Mithril.
 *
 * Extends the base Mithril Attributes with form-specific properties needed
 * for rendering dynamic forms from JSON configurations.
 *
 * @template O - The type of the object being edited by the form
 *
 * @example
 * ```typescript
 * interface User {
 *   name: string;
 *   email: string;
 *   age: number;
 * }
 *
 * const formProps: FormAttributes<User> = {
 *   form: userForm,
 *   obj: currentUser,
 *   onchange: (isValid, updatedUser) => {
 *     if (isValid && updatedUser) {
 *       saveUser(updatedUser);
 *     }
 *   },
 *   disabled: false,
 *   readonly: false
 * };
 * ```
 */
export type FormAttributes<O extends object> = Attributes & {
  /**
   * The form configuration to display.
   * An array of field definitions that define the structure and behavior of the form.
   */
  form: UIForm<O>;

  /**
   * The object being edited by the form.
   * This object will be modified as the user interacts with form fields.
   */
  obj: O;

  /**
   * Additional contextual data available to form fields.
   * Used for conditional field visibility, validation, and data transformation.
   */
  context?: FormContext<O>;

  /**
   * Callback function invoked when the form object changes.
   * Receives validation status and the updated object.
   *
   * @param isValid - Whether the current form state passes validation
   * @param obj - The updated object (may be undefined if invalid)
   */
  onchange?: (isValid: boolean, obj?: O) => void;

  /**
   * Controls whether the form or specific fields are disabled.
   * - `boolean`: Disables the entire form
   * - `string`: Disables fields based on expression evaluation
   * - `string[]`: Disables specific fields by ID
   */
  disabled?: boolean | string | string[];

  /**
   * Section ID to display - allows rendering only a portion of the form.
   * Useful for multi-step forms or tabbed interfaces.
   */
  section?: string;

  /**
   * Internationalization configuration for the form.
   * Provides locale-specific formatting, labels, and validation messages.
   */
  i18n?: I18n;

  /**
   * When true, renders the form in read-only mode.
   * Fields display their values but cannot be edited.
   */
  readonly?: boolean;
};

/**
 * Helper type to extract the element type from arrays with proper type constraints.
 * Ensures that array elements are treated as Record objects for form compatibility.
 *
 * @template T - The array type to extract from
 * @internal
 */
export type ArrayElement<T> = T extends readonly (infer U)[]
  ? U extends Record<string, any>
    ? U
    : Record<string, any>
  : Record<string, any>;

/**
 * A single field definition for a given key of O.
 *
 * If O[K] is:
 *  - a primitive → field is a simple ComponentType
 *  - an object → field is a nested UIForm
 *  - an array of primitives → field is a ComponentType
 *  - an array of objects → field is a nested UIForm for the array element type
 */
// export type UIFormField<O extends Record<string, any>, K extends keyof O = keyof O> = InputField<O, K> & {
//   id: K;
// } & (O[K] extends Record<string, any>
//     ? { type: UIForm<O[K]> } // nested object
//     : O[K] extends (infer U)[]
//     ? U extends Record<string, any>
//       ? { type: UIForm<U> } // array of objects
//       : { type: ComponentType } // array of primitives
//     : { type: ComponentType }); // primitive

// This is the discriminated union that allows either:
// 1. a plain input field, or
// 2. a nested form (recursive case)
export type UIFormField<T extends Record<string, any>, K extends keyof T = keyof T> =
  | (InputField<T, K> & { id: K; type: ComponentType }) // leaf field
  | (InputField<T, K> & { id: K; type: UIForm<T[K] extends Record<string, any> ? T[K] : any> }); // nested form

/**
 * A form is an array of fields, where each field id is tied to O's keys.
 */
export type UIForm<O extends Record<string, any>> = {
  [K in keyof O]: UIFormField<O, K>;
}[keyof O][];
