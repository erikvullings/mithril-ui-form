import m, { Component, Attributes } from 'mithril';
import { FlatButton, uniqueId, ModalPanel } from 'mithril-materialized';
import { IInputField, Form, IUIEvent, IObject } from '../models';
import { RepeatItem } from './repeat-item';
import { LayoutForm } from './layout-form';
import { deepCopy } from '../utils/helpers';

export interface IRepeatList<T extends IObject, C extends IObject> extends Attributes {
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
export const RepeatList = <T extends IObject, C extends IObject>(): Component<IRepeatList<T, C>> => {
  const state = {} as {
    field: IInputField<T, C> | Form<T, C>;
    containerId?: string;
    editId: string;
    deleteId: string;
    items: T[];
    onchange?: (items: T[]) => void;
    onclick: (e: IUIEvent) => void;
    editItem?: T;
    curItem?: T;
    newItem?: T;
    canSave?: boolean;
    editModal?: M.Modal;
    delModal?: M.Modal;
    modalKey?: string;
  };
  const notify = () => state.onchange && state.onchange(state.items);

  return {
    oninit: ({ attrs: { propKey: key, obj, field, label, onchange } }) => {
      state.onchange = onchange;
      const id = label ? label.toLowerCase().replace(/\s/gi, '_') : uniqueId();
      state.editId = 'edit_' + id;
      state.deleteId = 'delete_' + id;
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
              state.modalKey = uniqueId();
              state.editItem = undefined;
              state.newItem = {} as T;
            };
    },
    view: ({ attrs: { field, obj, context } }) => {
      const { items, onclick, editId, modalKey } = state;
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
                    state.curItem = it;
                    if (state.delModal) {
                      state.delModal.open();
                    }
                  },
                  onedit: it => {
                    state.modalKey = uniqueId();
                    state.curItem = it;
                    state.editItem = deepCopy(it);
                    if (state.editModal) {
                      state.editModal.open();
                    }
                  },
                  context,
                })
              )
          : undefined,
        m(ModalPanel, {
          onCreate: modal => (state.editModal = modal),
          id: editId,
          title: `Create new ${label}`,
          fixedFooter: true,
          description:
            typeof type === 'string' || !state.newItem
              ? undefined
              : m(
                  '.form-item',
                  m(LayoutForm, {
                    key: modalKey,
                    form: field.type as Form<any, C>,
                    obj: state.editItem || state.newItem,
                    onchange: isValid => (state.canSave = isValid),
                    context: context instanceof Array ? [obj, ...context] : [obj, context],
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
                if (state.editItem && state.curItem) {
                  const edited = state.editItem;
                  const current = state.curItem;
                  Object.keys(field.type).forEach(f => {
                    (current as any)[f] = edited[f];
                  });
                } else if (state.newItem) {
                  state.items.push(state.newItem);
                }
                notify();
              },
            },
          ],
        }),
        m(ModalPanel, {
          onCreate: modal => (state.delModal = modal),
          id: state.deleteId,
          title: 'Delete item',
          description: 'Are you sure?',
          buttons: [
            {
              label: 'No',
            },
            {
              label: 'Yes',
              onclick: () => {
                if (state.curItem) {
                  const i = state.items.indexOf(state.curItem);
                  if (i >= 0) {
                    state.items.splice(i, 1);
                  }
                  notify();
                }
              },
            },
          ],
        }),
      ]);
    },
  };
};
