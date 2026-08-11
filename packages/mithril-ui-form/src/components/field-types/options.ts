import m from 'mithril';
import { Options, FlatButton } from 'mithril-materialized';
import { ReadonlyComponent } from '../readonly';
import { FieldRenderer } from './types';

/** Shared by 'options' and 'select' - both display the resolved option label(s) when readonly. */
export const optionsSelectReadonly: FieldRenderer = ({ iv, props, options }) => {
  const checkedIds = (typeof iv !== 'undefined' ? ((iv as any) instanceof Array ? iv : [iv]) : []) as Array<
    string | number
  >;
  const selected = options.filter((o) => checkedIds.indexOf(o.id) >= 0);
  const initialValue =
    selected && selected.length === 0 ? '?' : selected.length === 1 ? selected[0].label : selected.map((o) => o.label);
  return m(ReadonlyComponent, {
    props,
    label: props.label,
    initialValue,
  });
};

export const optionsReadonly = optionsSelectReadonly;

export const optionsEditable: FieldRenderer = ({ iv, props, options, oninput, obj, id, field, selectAll, unselectAll, state }) => {
  const checkedId = iv as Array<string | number>;
  return [
    [
      m(Options<any>, {
        key: state.key,
        checkboxClass: 'col s6 m4 l3',
        className: 'input-field col s12',
        ...props,
        disabled: props.disabled || !options || options.length === 0,
        options,
        checkedId,
        onchange: (checkedIds: string[]) =>
          oninput(checkedIds.length === 1 ? checkedIds[0] : checkedIds.filter((v) => v !== null)),
      }),
    ],
    typeof field.checkAllOptions !== 'undefined' &&
      m('.col.s12.option-buttons', [
        m(FlatButton, {
          disabled: props.disabled,
          label: selectAll,
          iconName: 'check',
          onclick: () => {
            state.key = Date.now();
            oninput(options.map((o) => (typeof o === 'string' ? o : o.id)));
          },
        }),
        unselectAll &&
          m(FlatButton, {
            disabled: props.disabled,
            label: unselectAll,
            iconName: 'check_box_outline_blank',
            onclick: () => {
              const ids = (obj[id as keyof typeof obj] || []) as Array<string | number>;
              ids.length = 0;
              state.key = Date.now();
              oninput(ids);
            },
          }),
      ]),
  ];
};
