import { Vnode, Component } from 'mithril';
import { IInputField } from './input-field';

export type PluginType<V = any, F = any, O = any> = (
  vnode: Vnode<{
    /** Initial value, typically a string, number or boolean */
    iv?: V;
    /** Original properties of the form field */
    field: IInputField & F;
    /** Partially converted properties, e.g. the ones containing placeholders for other variables, e.g. label, description, etc. */
    props: IInputField;
    /** Label, raw version of props.label */
    label?: string;
    /** Only present when component is not readonly */
    onchange?: (value: V) => Promise<void>;
    /** The currently active object, which be the main object, or an item in an array */
    obj: O;
    /** The active context */
    context?: O;
  }>
) => Component<{
  /** Initial value, typically a string, number or boolean */
  iv?: V;
  /** Original properties of the form field */
  field: IInputField & F;
  /** Partially converted properties, e.g. the ones containing placeholders for other variables, e.g. label, description, etc. */
  props: IInputField;
  /** Label, raw version of props.label */
  label?: string;
  /** Only present when component is not readonly */
  onchange?: (value: V) => Promise<void>;
  /** The currently active object, which be the main object, or an item in an array */
  obj: O;
  /** The active context */
  context?: O;
}>;
