import m from 'mithril';
import { InputCheckbox } from 'mithril-materialized';
import { ReadonlyComponent } from '../readonly';
import { FieldRenderer } from './types';

/** Shared by 'checkbox' and 'switch' - both display as a checkmark/cross when readonly. */
export const booleanReadonly: FieldRenderer = ({ iv, props }) => {
  const checked = iv as boolean;
  const initialValue = checked ? '✔' : '✘';
  return m(ReadonlyComponent, {
    props,
    label: props.label,
    initialValue,
    inline: true,
  });
};

export const checkboxReadonly = booleanReadonly;

export const checkboxEditable: FieldRenderer = ({ iv, props, oninput }) => {
  const checked = Boolean(iv);
  return m(InputCheckbox, { ...props, checked, onchange: oninput });
};
