import m from 'mithril';
import { NumberInput } from 'mithril-materialized';
import { FieldRenderer } from './types';

/** No dedicated readonly rendering - falls back to the generic default readonly display. */
export const numberEditable: FieldRenderer = ({ iv, props, validate, autofocus, oninput, onkeydown, onkeyup, onblur }) => {
  const value = iv as number;
  return m(NumberInput, { ...props, validate, autofocus, oninput, value, onkeydown, onkeyup, onblur });
};
