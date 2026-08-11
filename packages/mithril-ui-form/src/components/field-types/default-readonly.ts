import m from 'mithril';
import { ReadonlyComponent } from '../readonly';
import { FieldRenderer } from './types';

/** Fallback readonly rendering for any type without a dedicated readonly renderer. */
export const defaultReadonly: FieldRenderer = ({ iv, props, fieldType }) => {
  const initialValue = iv as string;
  return m(ReadonlyComponent, {
    props,
    type: fieldType,
    label: props.label,
    initialValue,
  });
};
