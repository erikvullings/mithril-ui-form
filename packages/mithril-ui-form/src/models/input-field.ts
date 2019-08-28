import { ComponentType } from './component-type';
import { Form } from './form';
import { I18n } from './i18n';

/**
 * A form component represents the GUI used to create an object. The object that
 * is created has different properties. Each property is referenced by its ID
 * value.
 */
export interface IInputField {
  /** Property key, not required for markdown blocks */
  id?: string;
  /** Component label */
  label?: string;
  /** Optional description */
  description?: string;
  /** Can be used as a placeholder for text inputs or the first element of a Selection */
  placeholder?: string;
  /** Type of component to use */
  type?: ComponentType | Form; // Form<T[Extract<keyof T, string>], C | [T, C]>;
  /** Value that the component has, initially. Is also used to derive the type if not supplied. */
  value?: string | number | Date | boolean | string[];
  /**
   * Options for checkboxes, selects, dropdowns, and switches. In case it is a string,
   * it refers to an external pre-defined property that contains the options. E.g. a
   * list of countries.
   */
  options?: Array<{ id: string; label: string; disabled?: boolean; icon?: string; show?: string | string[] }>;
  /** When input type is a number, optionally specify the minimum value. */
  min?: number;
  /** When input type is a number, optionally specify the maximum value. */
  max?: number;
  /** When input type is a text or text area, optionally specify the minimum length. */
  minLength?: number;
  /** When input type is a text or text area, optionally specify the maximum length. */
  maxLength?: number;
  /** If true, the property is required */
  required?: boolean;
  /** If true, the select property allows for multiple selections */
  multiple?: boolean;
  /** If true, the property is disabled */
  disabled?: boolean | string | string[];
  /** CSS class name to attach to the element */
  className?: string;
  /** CSS class for the content, e.g. for grouping an options list */
  checkboxClass?: string;
  // model: FormType<T[Extract<keyof T, string>]>;
  /** Name of the icon */
  icon?: string;
  /** Class of the icon */
  iconClass?: string;
  /** If true, break to a new line */
  newLine?: boolean;
  /** Only valid for type='section', indicates section level */
  level?: number;
  /** Autogenerate a GUID or ID (shorter, starting with `id`) value */
  autogenerate?: 'id' | 'guid';
  /** If true, repeat the item multiple times (indicates it is an array) */
  repeat?: boolean;
  /**
   * By default, show every element, except when this property is defined. In that case, show when:
   * - show is a string with a elementID, and elementID is selected (as an answer)
   * - show is a string array, and one of the elementIDs is selected (OR condition)
   * When the string contains commas, separating elementIDs, only show it when all of these
   * elements have been selected (AND condition).
   */
  show?: string | string[];
  /** Translation keys, read once on initialization */
  i18n?: I18n;
}
