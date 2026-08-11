import m from 'mithril';
import { EmailInput } from 'mithril-materialized';
import { FieldRenderer } from './types';

/** No dedicated readonly rendering - falls back to the generic default readonly display. */
export const emailEditable: FieldRenderer = ({ iv, props, validate, autofocus, oninput, onkeydown, onkeyup, onblur }) => {
  const value = iv as string;
  return m(EmailInput, { ...props, validate, autofocus, oninput, value, onkeydown, onkeyup, onblur });
};
