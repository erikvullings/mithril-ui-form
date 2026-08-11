import m from 'mithril';
import { Select } from 'mithril-materialized';
import { optionsSelectReadonly } from './options';
import { FieldRenderer } from './types';

/** Readonly display is shared with 'options' - see options.ts:optionsSelectReadonly. */
export const selectReadonly = optionsSelectReadonly;

export const selectEditable: FieldRenderer = ({ iv, props, options, i18n, oninput }) => {
  const checkedId = iv as Array<string | number>;
  return m(Select<any>, {
    placeholder: props.multiple ? i18n.pickOneOrMore || 'Pick one or more' : i18n.pickOne || 'Pick one',
    ...props,
    disabled: props.disabled || !options || options.length === 0,
    options,
    checkedId,
    onchange: (checkedIds: string[]) =>
      oninput(
        checkedIds.length === 1 && !props.multiple
          ? checkedIds[0]
          : checkedIds.filter((v) => v !== null || typeof v !== 'undefined')
      ),
  });
};
