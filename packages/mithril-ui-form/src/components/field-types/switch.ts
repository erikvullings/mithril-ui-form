import m from 'mithril';
import { Switch } from 'mithril-materialized';
import { booleanReadonly } from './checkbox';
import { FieldRenderer } from './types';

/** Readonly display is shared with 'checkbox' - see checkbox.ts:booleanReadonly. */
export const switchReadonly = booleanReadonly;

export const switchEditable: FieldRenderer = ({ iv, props, options, oninput }) => {
  const checked = iv as boolean;
  const left = options && options.length > 0 ? (options[0].label ?? '') : '';
  const right = options && options.length > 1 ? (options[1].label ?? '') : '';
  return m(Switch, { ...props, left, right, checked, onchange: oninput });
};
