import m, { FactoryComponent, Attributes } from 'mithril';
import { FlatButton, uniqueId, ModalPanel } from 'mithril-materialized';
import { IInputField, Form, IUIEvent, IObject } from '../models';
import { RepeatItem } from './repeat-item';
import { LayoutForm } from './layout-form';
import { deepCopy } from '../utils/helpers';

export interface IRepeatList extends Attributes {
  /** The input field (or form) that must be rendered repeatedly */
  field: IInputField;
  /** The result object */
  obj: IObject | IObject[];
  /** The context */
  context: IObject;
  /** Callback function, invoked every time the original result object has changed */
  onchange?: (items: IObject[]) => void;
  /** Section ID to display - can be used to split up the form and only show a part */
  section?: string;
}

/**
 * A component that is a wrapper around another component, allowing the creation of new items,
 * and its items can be edited or deleted.
 *
 * It creates an array of primitives when type is a IFormComponent, and an array of objects when its type
 * is a FormType.
 */
export const RepeatList: FactoryComponent<IRepeatList> = () => {
  const state = {} as {
    field: IInputField | Form;
    containerId?: string;
    editId: string;
    deleteId: string;
    items: IObject[];
    onchange?: (items: IObject[]) => void;
    onclick: (e: IUIEvent) => void;
    editItem?: IObject;
    curItem?: IObject;
    newItem?: IObject;
    canSave?: boolean;
    editModal?: M.Modal;
    delModal?: M.Modal;
    modalKey?: string;
  };
  const notify = () => state.onchange && state.onchange(state.items);

  return {
    oninit: ({ attrs: { obj, field, label, onchange } }) => {
      const { id } = field;
      state.onchange = onchange;
      const compId = label ? label.toLowerCase().replace(/\s/gi, '_') : uniqueId();
      state.editId = 'edit_' + compId;
      state.deleteId = 'delete_' + compId;
      if (obj instanceof Array) {
        state.items = obj;
      } else {
        if (!obj.hasOwnProperty(id)) {
          obj[id] = [];
        }
        state.items = obj[id];
      }
      state.field = field;
      state.onclick =
        typeof field.type === 'string'
          ? () => {
              return;
            }
          : () => {
              state.modalKey = uniqueId();
              state.editItem = undefined;
              state.newItem = {} as IObject;
            };
    },
    view: ({ attrs: { field, obj, context, className = '.col.s12', section } }) => {
      const { items, onclick, editId, modalKey } = state;
      const { label, type } = field;

      return m(`.repeat-list.input-field${className}`, [
        m(FlatButton, {
          iconName: 'add',
          iconClass: 'right',
          label,
          onclick,
          modalId: editId,
          style: 'padding: 0',
        }),
        items && items.length
          ? typeof type === 'string'
            ? undefined
            : items.map(item =>
                m(RepeatItem, {
                  disabled: true,
                  item,
                  form: field.type as Form,
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
                  section,
                })
              )
          : undefined,
        typeof type === 'string' || typeof type === 'undefined'
          ? undefined
          : m(ModalPanel, {
              onCreate: modal => (state.editModal = modal),
              id: editId,
              title: state.editItem ? 'Edit item' : 'Create new item',
              fixedFooter: true,
              description: m(
                '.form-item',
                m(LayoutForm, {
                  key: modalKey,
                  form: type,
                  obj: state.editItem || state.newItem || {},
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
                      type.forEach(f => {
                        (current as any)[f.id] = edited[f.id];
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
