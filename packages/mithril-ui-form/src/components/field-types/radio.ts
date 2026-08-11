import m from 'mithril';
import { RadioButtons } from 'mithril-materialized';
import { ReadonlyComponent } from '../readonly';
import { FieldRenderer } from './types';

export const radioReadonly: FieldRenderer = ({ iv, props, options }) => {
  const checkedId = iv as string | number;
  const selected = options.filter((o) => o.id === checkedId);
  const initialValue = selected && selected.length ? selected[0].label : '?';
  return m(ReadonlyComponent, {
    props,
    label: props.label,
    initialValue,
  });
};

export const radioEditable: FieldRenderer = ({ iv, props, options, oninput }) => {
  const checkedId = iv as string | number;
  return m(RadioButtons, {
    label: '',
    ...props,
    options,
    checkedId,
    onchange: oninput,
  });
};
