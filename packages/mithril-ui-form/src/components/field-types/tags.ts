import m from 'mithril';
import { Chips, ChipData } from 'mithril-materialized';
import { ReadonlyComponent } from '../readonly';
import { FieldRenderer } from './types';

export const tagsReadonly: FieldRenderer = ({ iv, props }) => {
  const initialValue = (iv || []) as string[];
  return m(ReadonlyComponent, {
    props,
    label: props.label,
    initialValue,
  });
};

export const tagsEditable: FieldRenderer = ({ iv, props, options, field, oninput }) => {
  const value = (iv ? ((iv as any) instanceof Array ? iv : [iv]) : []) as string[];
  const data = value.map((chip) => ({ tag: chip }));
  const autocompleteOptions =
    options && options.length > 0
      ? {
          data: options.reduce(
            (acc, cur) => {
              acc[cur.id] = null;
              return acc;
            },
            {} as { [key: string]: null }
          ),
          limit: field.maxLength || Infinity,
          minLength: field.minLength || 1,
        }
      : undefined;
  const { label, isMandatory, className, helperText } = props;
  return m(Chips, {
    className,
    label,
    isMandatory,
    helperText,
    placeholder: field.placeholder || 'Add a tag',
    secondaryPlaceholder: field.secondaryPlaceholder || '+tag',
    data,
    onchange: (chips: ChipData[]) => oninput(chips.map((chip) => chip.tag)),
    autocompleteOptions,
  });
};
