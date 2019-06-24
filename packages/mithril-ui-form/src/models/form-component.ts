import { ComponentType } from './component-type';

/**
 * A form component represents the GUI used to create an object. The object that
 * is created has different properties. Each property is referenced by its ID
 * value.
 */
export interface IFormComponent<T> {
  /** Component label */
  label?: string;
  /** Optional description */
  description?: string;
  /** Can be used as a placeholder for text inputs */
  placeholder?: string;
  /** Type of component to use */
  type: ComponentType | FormType<T[keyof T]>;
  /** Value that the component has, initially. Is also used to derive the type if not supplied. */
  value?: string | number | Date | boolean | string[];
  /**
   * Options for checkboxes, selects, dropdowns, and switches. In case it is a string,
   * it refers to an external pre-defined property that contains the options. E.g. a
   * list of countries.
   */
  options?: Array<{ id: string; label: string; disabled?: boolean; icon?: string }> | string;
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
  /** If true, the property is disabled */
  disabled?: boolean;
  /** CSS class name to attach to the element */
  className?: string;
  /** Name of the icon */
  icon?: string;
  /** Class of the icon */
  iconClass?: string;
  /** If true, break to a new line */
  newLine?: boolean;
  /**
   * By default, repeat is 0. In case it is 1 or more, it means that we can repeat
   * (and delete) the element or group.
   * In case of a string, the resolved value should be a number too.
   */
  repeat?: number | string;
  /**
   * By default, show every element, except when this property is defined. In that case, show when:
   * - show is a string with a elementID, and elementID is selected (as an answer)
   * - show is a string array, and one of the elementIDs is selected (OR condition)
   * When the string contains commas, separating elementIDs, only show it when all of these
   * elements have been selected (AND condition).
   */
  show?: string | string[];
}

export const isFormComponent = <T>(
  x?: IFormComponent<T> | FormType<T>[Extract<keyof T, string>]
): x is IFormComponent<T> => (x ? x.hasOwnProperty('type') : false);

export const isComponentType = <T>(x?: ComponentType | FormType<T[keyof T]>): x is ComponentType =>
  typeof x === 'string';

/** A form (with multiple GUI components) or a single GUI component */
export type FormType<T> = { [K in Extract<keyof T, string>]?: IFormComponent<T> | FormType<T[K]> };

/** Model */
/*
interface IEditor {
  name: string;
  role: string;
  organisation: string;
  email: string;
}
interface ISource {
  title: string;
  url: string;
}

interface ILessonLearned {
  id: string;
  event: string;
  description: string;
  created: Date;
  edited: Date;
  editors: IEditor[];
  sources: ISource[];
  // eventDescription: {
  //   riskCategory: {};
  // };
}

const editor = {
  name: { type: 'text', maxLength: 80, required: true, className: 'col.s6' },
  role: { type: 'text', maxLength: 20 },
} as FormType<IEditor>;

const source = {
  title: { type: 'text', maxLength: 80, required: true, icon: 'title' },
  url: { type: 'url', maxLength: 80, required: true },
} as FormType<ISource>;

const info = {
  id: { type: 'text', maxLength: 80, required: true },
  event: { type: 'text', maxLength: 80, required: true },
  description: { type: 'textarea', maxLength: 500, required: true },
  created: { type: 'date', required: true },
  edited: { type: 'date', required: true },
  editors: { label: 'editors', type: editor },
  sources: {
    type: {
      title: { type: 'text', maxLength: 80, required: true, icon: 'title' },
      url: { type: 'url', maxLength: 80, required: true },
    },
  },
  // editors: { type: 'kanban', model: editor },
} as FormType<ILessonLearned>;

const ll = [
  info,
  source,
  // eventDescription: {},
] as Array<FormType<ILessonLearned>>;
*/
