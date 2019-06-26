import m, { Component, Attributes } from 'mithril';
import { FlatButton, uniqueId, ModalPanel } from 'mithril-materialized';
import { IInputField, Form, IUIEvent } from '../models';
import { RepeatItem } from './repeat-item';
import { LayoutForm } from './layout-form';

export interface IRepeatList<T> extends Attributes {
  propKey: Extract<keyof T, string>;
  field: IInputField<T>;
  obj: T;
  // options: {
    autofocus?: boolean;
    onchange?: () => void;
  // };
  // key: Extract<keyof T, string>;
  // obj: T;
  // label?: string;
  // type: IInputField<T> | Form<T>;
  // items: T[];
  // containerId?: string;
}

/**
 * A component that is a wrapper around another component, allowing the creation of new items,
 * and its items can be edited or deleted.
 *
 * It creates an array of primitives when type is a IFormComponent, and an array of objects when its type
 * is a FormType.
 */
export const RepeatList = <T extends { [key: string]: any }>(): Component<IRepeatList<T>> => {
  const state = {} as {
    field: IInputField<T> | Form<T>;
    containerId?: string;
    editId: string;
    deleteId: string;
    items: T[];
    onchange?: (items: T[]) => void;
    onclick: (e: IUIEvent) => void;
    curItem?: T;
    updatedItem?: T;
    canSave?: boolean;
  };
  const notify = () => state.onchange && state.onchange(state.items);

  return {
    oninit: ({ attrs: { propKey: key, obj, field, label } }) => {
      const id = label ? label.toLowerCase().replace(/\s/gi, '_') : uniqueId();
      state.editId = 'edit_' + id;
      // state.deleteId = 'delete_' + id;
      // state.containerId = containerId;
      if (!obj.hasOwnProperty(key)) {
        obj[key] = [] as T[Extract<keyof T, string>];
      }
      state.items = obj[key];
      state.field = field;
      state.onclick =
        typeof field.type === 'string'
          ? () => { return; }
          : () => {
              state.curItem = undefined;
              state.updatedItem = {} as T;
              // state.items.push(state.updatedItem);
            };
    },
    view: ({ attrs: { field } }) => {
      const { items, onclick, editId } = state;
      const { label, type } = field;

      // const items = (value || []) as Array<string | number | { [key: string]: any }>;
      // obj[key] = items as any;

      return m('.repeat-component', [
        m(FlatButton, {
          iconName: 'add',
          iconClass: 'right',
          label,
          onclick,
          modalId: editId,
          style: 'padding-left: 8px;',
        }),
        items && items.length
          ? typeof type === 'string'
            ? undefined // e.g. use a tag editor
            : items.map(item =>
                m(RepeatItem, {
                  item,
                  form: field.type as Form<any>,
                  ondelete: it => {
                    const i = state.items.indexOf(it);
                    if (i >= 0) {
                      state.items.splice(i, 1);
                    }
                  },
                  onedit: i => {
                    return i;
                  },
                })
              )
          : undefined,
        m(ModalPanel, {
          id: editId,
          title: `Create new ${label}`,
          description:
            typeof type === 'string' || !state.updatedItem
              ? undefined
              : m('.form-item', m(LayoutForm, { form: field.type as Form<any>, result: state.updatedItem })),
              // : m('.form-item', formFactory(field.type as Form<any>, state.updatedItem)),
          buttons: [
            {
              iconName: 'cancel',
              label: 'Cancel',
            },
            {
              iconName: 'save',
              label: 'Save',
              disabled: !state.canSave,
              onclick: () => {
                if (state.curItem) {
                  const curItem = state.curItem;
                  Object.keys(field.type).forEach(f => {
                    (curItem as any)[f] = (state.updatedItem as any)[f];
                  });
                } else if (state.updatedItem) {
                  state.items.push(state.updatedItem);
                }
                notify();
              },
            },
          ],
        }),
      ]);
    },
  };
};
