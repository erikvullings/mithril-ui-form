import m from 'mithril';
import { ColorInput } from 'mithril-materialized';
import { FieldRenderer } from './types';

/** No dedicated readonly rendering - falls back to the generic default readonly display. */
export const colourEditable: FieldRenderer = ({ iv, props, oninput, onblur }) => {
  const value = iv as string;
  return m(ColorInput, { ...props, value, oninput, onblur });
};
