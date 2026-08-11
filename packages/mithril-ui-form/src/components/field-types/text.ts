import m from 'mithril';
import { TextInput } from 'mithril-materialized';
import { FieldRenderer } from './types';

/** No dedicated readonly rendering - falls back to the generic default readonly display. */
export const textEditable: FieldRenderer = ({ iv, props, field, validate, autofocus, oninput, onkeydown, onkeyup, onblur }) => {
  const value = iv as string;
  return m(TextInput, {
    ...props,
    maxLength: field.max || undefined,
    validate,
    autofocus,
    oninput,
    value,
    onkeydown,
    onkeyup,
    onblur,
  });
};
