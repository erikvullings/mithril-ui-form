import { Attributes } from 'mithril';
import { I18n } from './i18n';
import { InputField } from './input-field';
import { ComponentType } from './component-type';

export type FormAttributes<O extends Attributes = {}> = Attributes & {
  /** The form to display */
  form: UIForm<O>;
  /** The resulting object */
  obj: O;
  /** Relevant context, i.e. the original object and other context from the environment */
  context?: Array<Partial<O> | O[keyof O] | any>; // TODO Check this type, may be an array of contexts
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

/** A form with one or more input fields or forms (to allow for nested objects) */
export type UIForm<O extends Attributes = {}> = Array<
  InputField<O, keyof O> & {
    type?: ComponentType | UIForm<O[keyof O]> | UIForm<O[keyof O] extends any[] ? O[keyof O][number] : O[keyof O]>;
  }
>;
