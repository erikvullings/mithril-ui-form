import { FactoryComponent } from 'mithril';
import { IInputField } from './input-field';

export type PluginType = FactoryComponent<{
  /** Initial value, typically a string, number or boolean */
  iv: any;
  /** Original properties of the form field */
  field: IInputField & Record<string, any>;
  /** Partially converted properties, e.g. the ones containing placeholders for other variables, e.g. label, description, etc. */
  props: IInputField & Record<string, any>;
  /** Label, raw version of props.label */
  label?: string;
  /** Only present when component is not readonly */
  onchange?: (value: string | number | Array<string | number | Record<string, any>> | Date | boolean) => Promise<void>;
}>;
