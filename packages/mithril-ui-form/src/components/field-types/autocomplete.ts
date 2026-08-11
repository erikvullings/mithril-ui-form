import m from 'mithril';
import { Autocomplete } from 'mithril-materialized';
import { FieldRenderer } from './types';

/** No dedicated readonly rendering - falls back to the generic default readonly display. */
export const autocompleteEditable: FieldRenderer = ({ iv, props, options, field, oninput, onblur }) => {
  const value = iv as string;
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
      : { data: {} };
  const { label, isMandatory, className, helperText } = props;
  return m(Autocomplete, {
    value,
    className,
    label,
    isMandatory,
    helperText,
    oninput,
    onblur,
    placeholder: field.placeholder || '...',
    ...autocompleteOptions,
  });
};
