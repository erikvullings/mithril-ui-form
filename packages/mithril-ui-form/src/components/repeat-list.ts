import m, { FactoryComponent, Attributes } from 'mithril';
import { FlatButton, uniqueId, ModalPanel, Pagination, RoundIconButton, TextInput } from 'mithril-materialized';
import { IInputField, Form, IUIEvent, IObject } from '../models';
import { RepeatItem } from './repeat-item';
import { LayoutForm } from './layout-form';
import { deepCopy, range, stripSpaces } from '../utils';
import { I18n } from '../models/i18n';

export interface IRepeatList extends Attributes {
  /** The input field (or form) that must be rendered repeatedly */
  field: IInputField;
  /** The result object */
  obj: IObject | IObject[];
  /** The context */
  context: IObject;
  /**
   * If true, use the inline version, otherwise, open a modal.
   * @default true
   */
  inline: boolean;
  /** Callback function, invoked every time the original result object has changed */
  onchange?: (items: IObject[]) => void;
  /** Section ID to display - can be used to split up the form and only show a part */
  section?: string;
  /** Translation keys, read once on initialization */
  i18n?: Partial<I18n>;
  /** Optional container ID for DatePicker and TimePicker to render their content in */
  containerId?: string;
  /** If true, the repeat component is disabled, and adding, deleting or editing items is prohibited */
  disabled?: boolean;
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
    editLabel: string;
    createLabel: string;
    /** When dealing with a large list, you may add a property filter */
    filterValue?: string;
  };

  // const nextKeyGen = () => {
  //   let i = 0;
  //   return () => {
  //     i++;
  //     return i;
  //   };
  // };

  // const nextKey = nextKeyGen();

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
    oninit: ({
      attrs: {
        field,
        onchange,
        i18n,
        field: { id = '' },
      },
    }) => {
      state.onchange = onchange;
      state.editLabel = i18n && i18n.editRepeat ? i18n.editRepeat : `Edit ${id}`;
      state.createLabel = i18n && i18n.createRepeat ? i18n.createRepeat : `Create new ${id}`;
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
    view: ({
      attrs: { field, obj, context, className = '.col.s12', section, containerId, inline = true, disabled },
    }) => {
      const { onclick, modalKey, filterValue } = state;
      const { id = '', label, type, max, pageSize, propertyFilter, filterLabel } = field;
      const compId = label ? label.toLowerCase().replace(/\s/gi, '_') : uniqueId();
      const editId = 'edit_' + compId;
      const deleteId = 'delete_' + compId;
      const allItems = getItems(obj, id);
      const strippedFilterValue = filterValue ? stripSpaces(filterValue) : undefined;
      const items =
        propertyFilter && strippedFilterValue && strippedFilterValue.length > 2
          ? allItems.filter(o => {
              const prop = o[propertyFilter];
              return prop && (prop.indexOf(strippedFilterValue) >= 0 || prop.indexOf(filterValue) >= 0);
            })
          : allItems;
      const page = m.route.param(id) ? Math.min(items.length, +m.route.param(id)) : 1;
      const curPage = pageSize && items && (page - 1) * pageSize < items.length ? page : 1;
      const delimitter = pageSize
        ? (_: any, i: number) => (curPage - 1) * pageSize <= i && i < curPage * pageSize
        : max
        ? (_: any, i: number) => i < max
        : () => true;
      const regex = new RegExp(`\\??\\&?${id}=\\d+`);
      const route = m.route.get().replace(regex, '');
      const maxPages = pageSize ? Math.ceil(items.length / pageSize) : 0;
      // console.table({ id: field.id, page, curPage, maxPages, length: items.length });

      return [
        [
          inline
            ? m(`.row.repeat-list.input-field${className}`, [
                m('.row', [
                  m(FlatButton, {
                    iconName: disabled ? '' : 'add',
                    iconClass: 'right',
                    label,
                    onclick: () => {
                      items.push({});
                      m.route.set(`${route}${route.indexOf('?') >= 0 ? '&' : '?'}${id}=${items.length}`);
                    },
                    style: 'padding: 0',
                    className: 'left',
                    disabled,
                  }),
                  maxPages > 1 &&
                    m(
                      '.right',
                      m(Pagination, {
                        curPage,
                        items: range(1, maxPages).map(i => ({
                          href: `${route}${route.indexOf('?') >= 0 ? '&' : '?'}${id}=${i}`,
                        })),
                      })
                    ),
                  (items.length > 1 || filterValue) &&
                    propertyFilter &&
                    !disabled &&
                    m(TextInput, {
                      style: 'margin-top: -6px; margin-bottom: -1rem;',
                      iconName: 'filter_list',
                      iconClass: 'small',
                      placeholder: filterLabel,
                      onkeyup: (_: KeyboardEvent, v?: string) => (state.filterValue = v),
                      className: 'right',
                      disabled,
                    }),
                ]),
                items && items.length
                  ? typeof type === 'string'
                    ? undefined
                    : items.filter(delimitter).map(item => [
                        m('.row.z-depth-1', [
                          m(LayoutForm, {
                            key: page,
                            form: field.type as Form,
                            obj: item,
                            context: [obj, context],
                            section,
                            containerId,
                            disabled,
                            onchange: () => notify(items),
                          }),
                          !disabled &&
                            m(
                              '.clearfix',
                              { key: 0 },
                              m(RoundIconButton, {
                                className: 'btn-small right',
                                iconName: 'delete',
                                iconClass: 'red',
                                style: 'margin: 0 10px 10px 0;',
                                disabled,
                                onclick: () => {
                                  state.curItem = item;
                                  if (state.delModal) {
                                    state.delModal.open();
                                  }
                                },
                              })
                            ),
                        ]),
                      ])
                  : undefined,
              ])
            : m(
                `.repeat-list.input-field${className}`,
                // { key: nextKey() },
                [
                  m(FlatButton, {
                    iconName: disabled ? '' : 'add',
                    iconClass: 'right',
                    label,
                    onclick,
                    modalId: editId,
                    style: 'padding: 0',
                    disabled,
                  }),
                  items && items.length
                    ? typeof type === 'string'
                      ? undefined
                      : items.filter(delimitter).map(item =>
                          m(RepeatItem, {
                            disabled: true,
                            item,
                            form: field.type as Form,
                            containerId,
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
                ]
              ),
        ],
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
        inline || typeof type === 'string' || typeof type === 'undefined'
          ? undefined
          : m(ModalPanel, {
              onCreate: modal => (state.editModal = modal),
              id: editId,
              title: state.editItem ? state.editLabel : state.createLabel,
              fixedFooter: true,
              description: m(
                '.row.form-item',
                m(LayoutForm, {
                  key: modalKey,
                  form: type,
                  obj: state.editItem || state.newItem || {},
                  onchange: isValid => (state.canSave = isValid),
                  context: context instanceof Array ? [obj, ...context] : [obj, context],
                  containerId,
                  disabled,
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
      ];
    },
  };
};
