import m from 'mithril';
import { LikertScale } from 'mithril-materialized';
import { ReadonlyComponent } from '../readonly';
import { FieldRenderer } from './types';

export const likertReadonly: FieldRenderer = ({ iv, props }) => {
  const initialValue = typeof iv === 'string' ? parseInt(iv) : typeof iv === 'number' ? iv : '';
  return m(ReadonlyComponent, { props, initialValue, label: props.label });
};

export const likertEditable: FieldRenderer = ({ iv, props, field, oninput }) => {
  const value = typeof iv === 'string' ? parseInt(iv) : typeof iv === 'number' ? iv : undefined;
  return m('.col.s12', m(LikertScale, { min: 0, max: 5, ...props, value, label: field.label, onchange: oninput }));
};
