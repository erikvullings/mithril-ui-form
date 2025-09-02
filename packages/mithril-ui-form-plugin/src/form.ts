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
 * Represents a single field within a UI form configuration.
 *
 * Extends InputField with enhanced type support for nested objects and arrays,
 * allowing for complex form structures with proper TypeScript inference.
 *
 * @template O - The type of the object being edited
 * @template K - The specific key of the object this field represents
 *
 * @example
 * ```typescript
 * interface User {
 *   name: string;
 *   address: {
 *     street: string;
 *     city: string;
 *   };
 *   hobbies: string[];
 * }
 *
 * // Simple text field
 * const nameField: UIFormField<User, 'name'> = {
 *   type: 'text',
 *   id: 'name',
 *   label: 'Full Name',
 *   required: true
 * };
 *
 * // Nested object field
 * const addressField: UIFormField<User, 'address'> = {
 *   type: [
 *     { type: 'text', id: 'street', label: 'Street' },
 *     { type: 'text', id: 'city', label: 'City' }
 *   ],
 *   id: 'address',
 *   label: 'Address Information'
 * };
 * ```
 */
export type UIFormField<O extends Record<string, any>, K extends keyof O = keyof O> = InputField<O, K> & {
  /**
   * The type of form field or nested form structure.
   *
   * - `ComponentType`: Standard form field type (text, number, select, etc.)
   * - `UIForm<T>`: Nested form for object or array properties
   *
   * For array properties (O[K] extends any[]), the type can be:
   * - A nested form for editing array elements: `UIForm<ArrayElement<O[K]>>`
   * - A standard field type for primitive arrays
   *
   * For object properties (O[K] extends Record<string, any>), the type can be:
   * - A nested form for the object structure: `UIForm<O[K]>`
   * - A standard field type if treating the object as a single value
   */
  type?:
    | ComponentType
    | (O[K] extends any[]
        ? UIForm<ArrayElement<O[K]>>
        : O[K] extends Record<string, any>
        ? UIForm<O[K]>
        : ComponentType);
};

/**
 * A complete form definition consisting of multiple form fields.
 *
 * The UIForm type represents the JSON configuration that defines the structure,
 * validation, and behavior of a dynamic form. It supports nested objects,
 * arrays, conditional field visibility, and complex validation rules.
 *
 * @template O - The type of the object being edited by the form
 *
 * @example
 * ```typescript
 * interface BlogPost {
 *   title: string;
 *   content: string;
 *   tags: string[];
 *   author: {
 *     name: string;
 *     email: string;
 *   };
 *   isPublished: boolean;
 * }
 *
 * const blogPostForm: UIForm<BlogPost> = [
 *   {
 *     type: 'text',
 *     id: 'title',
 *     label: 'Post Title',
 *     required: true,
 *     maxLength: 100
 *   },
 *   {
 *     type: 'textarea',
 *     id: 'content',
 *     label: 'Content',
 *     required: true,
 *     minLength: 10
 *   },
 *   {
 *     type: 'tags',
 *     id: 'tags',
 *     label: 'Tags',
 *     maxLength: 5
 *   },
 *   {
 *     type: [
 *       { type: 'text', id: 'name', label: 'Author Name', required: true },
 *       { type: 'email', id: 'email', label: 'Email', required: true }
 *     ],
 *     id: 'author',
 *     label: 'Author Information'
 *   },
 *   {
 *     type: 'checkbox',
 *     id: 'isPublished',
 *     label: 'Publish Post'
 *   }
 * ];
 * ```
 *
 * @see {@link UIFormField} for individual field configuration
 * @see {@link FormAttributes} for form component properties
 */
export type UIForm<O extends Record<string, any> = {}> = Array<UIFormField<O>>;
