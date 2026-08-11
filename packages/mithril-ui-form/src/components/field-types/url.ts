import m from 'mithril';
import { UrlInput } from 'mithril-materialized';
import { FieldRenderer } from './types';

/** No dedicated readonly rendering - falls back to the generic default readonly display. */
export const urlEditable: FieldRenderer = ({ iv, props, validate, autofocus, oninput, onkeydown, onkeyup, onblur }) => {
  const value = iv as string;
  return m(UrlInput, {
    placeholder: 'http(s)://www.example.com',
    ...props,
    validate,
    autofocus,
    oninput,
    value,
    onkeydown,
    onkeyup,
    onblur,
  });
};
