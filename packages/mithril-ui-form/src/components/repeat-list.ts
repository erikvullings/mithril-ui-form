import m, { Component, Attributes } from 'mithril';
import { FlatButton, uniqueId, ModalPanel } from 'mithril-materialized';
import { IInputField, Form, IUIEvent } from '../models';
import { RepeatItem } from './repeat-item';
import { LayoutForm } from './layout-form';
import { IObject } from '../models/object';

export interface IRepeatList<T extends { [key: string]: any }, C extends IObject> extends Attributes {
  /** Key of the property that is being repeated. Do not use `key` as this has side-effects in mithril. */
  propKey: Extract<keyof T, string>;
  /** The input field (or form) that must be rendered repeatedly */
  field: IInputField<T, C>;
  /** The result object */
  obj: T;
  /** Callback function, invoked every time the original result object has changed */
  onchange?: (items: T[]) => void;
}

/**
 * A component that is a wrapper around another component, allowing the creation of new items,
 * and its items can be edited or deleted.
 *
 * It creates an array of primitives when type is a IFormComponent, and an array of objects when its type
 * is a FormType.
 */
export const RepeatList = <T extends { [key: string]: any }, C extends IObject>(): Component<IRepeatList<T, C>> => {
  const state = {} as {
    field: IInputField<T, C> | Form<T, C>;
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
    oninit: ({ attrs: { propKey: key, obj, field, label, onchange } }) => {
      state.onchange = onchange;
      const id = label ? label.toLowerCase().replace(/\s/gi, '_') : uniqueId();
      state.editId = 'edit_' + id;
      if (!obj.hasOwnProperty(key)) {
        obj[key] = [] as T[Extract<keyof T, string>];
      }
      state.items = obj[key];
      state.field = field;
      state.onclick =
        typeof field.type === 'string'
          ? () => {
              return;
            }
          : () => {
              state.curItem = undefined;
              state.updatedItem = {} as T;
            };
    },
    view: ({ attrs: { field, obj, context } }) => {
      const { items, onclick, editId } = state;
      const { label, type } = field;

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
            ? undefined
            : items.map(item =>
                m(RepeatItem, {
                  disabled: true,
                  item,
                  form: field.type as Form<any, C>,
                  ondelete: it => {
                    const i = state.items.indexOf(it);
                    if (i >= 0) {
                      state.items.splice(i, 1);
                    }
                  },
                  onedit: i => {
                    return i;
                  },
                  context,
                })
              )
          : undefined,
        m(ModalPanel, {
          id: editId,
          title: `Create new ${label}`,
          fixedFooter: true,
          description:
            typeof type === 'string' || !state.updatedItem
              ? undefined
              : m(
                  '.form-item',
                  m(LayoutForm, {
                    key: Date.now(),
                    form: field.type as Form<any, C>,
                    obj: state.updatedItem,
                    onchange: isValid => (state.canSave = isValid),
                    context: context instanceof Array ? [ obj, ...context] : [obj, context],
                  })
                ),
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
