import { Attributes } from 'mithril';
import { I18n } from './i18n';
import { InputField } from './input-field';
import { ComponentType } from './component-type';

// Improved context typing for better type safety
export type FormContext<O> = Array<Partial<O> | O[keyof O]>;

export type FormAttributes<O extends Record<string, any> = {}> = Attributes & {
  /** The form to display */
  form: UIForm<O>;
  /** The resulting object */
  obj: O;
  /** Relevant context, i.e. the original object and other context from the environment */
  context?: FormContext<O>;
  /** Callback function, invoked every time the original result object has changed */
  onchange?: (isValid: boolean, obj?: O) => void;
  /** Disable the form, disallowing edits */
  disabled?: boolean | string | string[];
  /** Section ID to display - can be used to split up the form and only show a part */
  section?: string;
  /** Localization options */
  i18n?: I18n;
  /** Disable editing */
  readonly?: boolean;
};

// Helper type to extract array element type with proper constraint
type ArrayElement<T> = T extends readonly (infer U)[] 
  ? U extends Record<string, any> 
    ? U 
    : Record<string, any>
  : Record<string, any>;

// Improved UIForm type with better recursive handling
export type UIFormField<O extends Record<string, any>, K extends keyof O = keyof O> = InputField<O, K> & {
  type?: ComponentType | (O[K] extends any[] 
    ? UIForm<ArrayElement<O[K]>> 
    : O[K] extends Record<string, any> 
      ? UIForm<O[K]> 
      : ComponentType);
};

/** A form with one or more input fields or forms (to allow for nested objects) */
export type UIForm<O extends Record<string, any> = {}> = Array<UIFormField<O>>;
