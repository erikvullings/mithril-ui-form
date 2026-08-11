import m from 'mithril';
import { TextArea } from 'mithril-materialized';
import { FieldRenderer } from './types';

/** No dedicated readonly rendering - falls back to the generic default readonly display. */
export const textareaEditable: FieldRenderer = ({ iv, props, validate, autofocus, oninput, onkeyup, onkeydown, onblur }) => {
  const value = iv as string;
  return m(TextArea, { ...props, validate, autofocus, oninput, value, onkeyup, onkeydown, onblur });
};
