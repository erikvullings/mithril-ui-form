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
  const notify = (items: IObject[]) => state.onchange && state.onchange(items);

  const getItems = (obj: IObject | IObject[], id: string): IObject[] => {
    if (obj instanceof Array) {
      return obj;
    } else {
      if (!obj.hasOwnProperty(id)) {
        obj[id] = [];
      }
      return obj[id];
    }
  };

  return {
    oninit: ({ attrs: { field, onchange } }) => {
      state.onchange = onchange;
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
      const { onclick, modalKey } = state;
      const { id = '', label, type } = field;
      const compId = label ? label.toLowerCase().replace(/\s/gi, '_') : uniqueId();
      const editId = 'edit_' + compId;
      const deleteId = 'delete_' + compId;
      const items = getItems(obj, id);

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
                  context: [obj, context],
                  section,
                })
              )
          : undefined,
        typeof type === 'string' || typeof type === 'undefined'
          ? undefined
          : m(ModalPanel, {
              onCreate: modal => (state.editModal = modal),
              id: editId,
              title: (state.editItem ? 'Edit ' : 'Create new ') + id,
              fixedFooter: true,
              description: m(
                '.row.form-item',
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
                      console.warn('edited');
                      const edited = state.editItem;
                      const current = state.curItem;
                      type.forEach(f => {
                        if (f.id) {
                          (current as any)[f.id] = edited[f.id];
                        }
                      });
                    } else if (state.newItem) {
                      items.push(state.newItem);
                    }
                    notify(items);
                  },
                },
              ],
            }),
        m(ModalPanel, {
          onCreate: modal => (state.delModal = modal),
          id: deleteId,
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
                  const i = items.indexOf(state.curItem);
                  if (i >= 0) {
                    items.splice(i, 1);
                  }
                  notify(items);
                }
              },
            },
          ],
        }),
      ]);
    },
  };
};
