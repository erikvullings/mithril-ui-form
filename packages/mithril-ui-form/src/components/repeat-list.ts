import m, { FactoryComponent, Attributes } from 'mithril';
import { FlatButton, uniqueId, ModalPanel, Pagination, RoundIconButton, TextInput } from 'mithril-materialized';
import { I18n, IInputField, UIForm } from 'mithril-ui-form-plugin';
import { LayoutForm } from './layout-form';
import { range, stripSpaces, hash } from '../utils';

export interface IRepeatList extends Attributes {
  /** The input field (or form) that must be rendered repeatedly */
  field: IInputField;
  /** The result object */
  obj: Record<string, any> | Record<string, any>[];
  /** The context */
  context: Record<string, any> | Record<string, any>[];
  /** Callback function, invoked every time the original result object has changed */
  onchange?: (result: Record<string, any> | Record<string, any>[]) => void;
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
    editItem?: Record<string, any>;
    curItemIdx?: number;
    newItem?: Record<string, any>;
    canSave?: boolean;
    editModal?: M.Modal;
    modalKey?: string;
    editLabel: string;
    createLabel: string;
    /** When dealing with a large list, you may add a property filter */
    filterValue?: string;
    onNewItem?: (obj?: Record<string, any> | Record<string, any>[], id?: string) => Record<string, any>;
  };

  const getItems = (obj: Record<string, any> | Record<string, any>[], id: string): Record<string, any>[] => {
    if (obj instanceof Array) {
      return obj;
    } else {
      if (!obj.hasOwnProperty(id)) {
        obj[id] = [];
      }
      return obj[id];
    }
  };

  const addEmptyItem = (obj: Record<string, any> | Record<string, any>[], id: string) => {
    const newItem = state.onNewItem ? state.onNewItem(obj, id) : {};
    if (obj instanceof Array) {
      obj.push(newItem);
    } else {
      if (!obj.hasOwnProperty(id)) {
        obj[id] = [newItem];
      } else {
        obj[id].push(newItem);
      }
    }
  };

  const compareFnFactory = (sortProperty?: string) => {
    if (!sortProperty) {
      return (_a: Record<string, any>, _b: Record<string, any>) => 0;
    }
    const reverse = sortProperty[0] === '!';
    const key = reverse ? sortProperty.substring(1) : sortProperty;

    return reverse
      ? (a: Record<string, any>, b: Record<string, any>) => (a[key] > b[key] ? -1 : a[key] < b[key] ? 1 : 0)
      : (a: Record<string, any>, b: Record<string, any>) => (a[key] > b[key] ? 1 : a[key] < b[key] ? -1 : 0);
  };

  let compareFn: (a: Record<string, any>, b: Record<string, any>) => number;

  return {
    oninit: ({
      attrs: {
        i18n = {},
        field: { id = '', sortProperty, onNewItem },
      },
    }) => {
      state.editLabel = i18n.editRepeat || `Edit ${id}`;
      state.createLabel = i18n.createRepeat || `Create new ${id}`;
      state.onNewItem = onNewItem;
      compareFn = compareFnFactory(sortProperty);
    },
    view: ({
      attrs: {
        field,
        obj,
        context,
        className = field.className ? '.' + field.className.split(' ').join('.') : '.col.s12',
        section,
        containerId,
        disabled = typeof field.disabled === 'boolean' ? field.disabled : undefined,
        readonly: r,
        i18n = {},
        onchange,
      },
    }) => {
      const notify = (result: Record<string, any> | Record<string, any>[]) => onchange && onchange(result);
      const { modalKey, filterValue } = state;
      const {
        id = '',
        label,
        type,
        min,
        max,
        pageSize,
        propertyFilter,
        filterLabel,
        readonly = r,
        repeatItemClass = '',
      } = field;
      const compId = label ? label.toLowerCase().replace(/\s/gi, '_') : uniqueId();
      const editId = 'edit_' + compId;
      const allItems = getItems(obj, id);
      const strippedFilterValue = filterValue ? stripSpaces(filterValue) : undefined;
      const items =
        propertyFilter && strippedFilterValue && strippedFilterValue.length > 2
          ? allItems.filter((o) => stripSpaces(`${o[propertyFilter]}`).indexOf(strippedFilterValue) >= 0)
          : allItems;
      const page = m.route.param(id) ? Math.min(items.length, +m.route.param(id)) : 1;
      const curPage = pageSize && items && (page - 1) * pageSize < items.length ? page : 1;
      const delimitter = pageSize
        ? (_: any, i: number) => (curPage - 1) * pageSize <= i && i < curPage * pageSize
        : () => true;
      const regex = new RegExp(`\\??\\&?${id}=\\d+`);
      const route = (m.route.get() || '').replace(regex, '');
      const maxPages = pageSize ? Math.ceil(items.length / pageSize) : 0;
      const maxItemsReached = max && items.length >= max ? true : false;
      const canDeleteItems = disabled ? false : !min || items.length > min ? true : false;

      return [
        [
          m(`#${id}.repeat-list${className}`, [
            m(
              '.row',
              m('.col.s12', [
                m(FlatButton, {
                  iconName: disabled || maxItemsReached ? '' : 'add',
                  iconClass: 'right',
                  label,
                  onclick: () => {
                    // items.push({});
                    addEmptyItem(obj, id);
                    m.route.set(`${route}${route.indexOf('?') >= 0 ? '&' : '?'}${id}=${items.length}`);
                    notify(obj);
                  },
                  style: 'padding: 0',
                  className: 'left',
                  disabled: disabled || maxItemsReached,
                  readonly,
                }),
                maxPages > 1 &&
                  m(
                    '.right',
                    m(Pagination, {
                      curPage,
                      items: range(1, maxPages).map((i) => ({
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
                    readonly,
                  }),
              ])
            ),
            items &&
              items.length > 0 &&
              typeof type !== 'string' &&
              items
                .sort(compareFn)
                .filter(delimitter)
                .map((item, i) => [
                  canDeleteItems &&
                    m(RoundIconButton, {
                      iconName: 'clear',
                      iconClass: 'white black-text',
                      className: 'row mui-delete-item btn-small right',
                      style: 'padding: 0; margin-top: -10px; margin-right: -25px',
                      disabled,
                      readonly,
                      onclick: () => {
                        state.curItemIdx = i;
                      },
                    }),
                  [
                    m('.row.repeat-item', { className: repeatItemClass, key: page + hash(item) }, [
                      m(LayoutForm, {
                        form: field.type as UIForm,
                        obj: item,
                        i18n,
                        context: context instanceof Array ? [obj, ...context] : [obj, context],
                        section,
                        containerId,
                        disabled,
                        readonly,
                        onchange: () => notify(obj),
                      }),
                    ]),
                  ],
                ]),
            !(disabled || maxItemsReached || readonly || !items || items.length === 0) &&
              m(RoundIconButton, {
                iconName: 'add',
                iconClass: 'white black-text',
                className: 'row mui-add-new-item btn-small right',
                style: 'padding: 0; margin-top: -10px; margin-right: -25px',
                onclick: () => {
                  addEmptyItem(obj, id);
                  m.route.set(`${route}${route.indexOf('?') >= 0 ? '&' : '?'}${id}=${items.length}`);
                  notify(obj);
                },
              }),
          ]),
        ],
        typeof state.curItemIdx !== 'undefined' &&
          m(ModalPanel, {
            id: 'deleteItem',
            onCreate: (modal) => modal.open(),
            options: {
              onCloseStart: () => {
                // console.log('On Close');
                state.curItemIdx = undefined;
                m.redraw();
              },
            },
            fixedFooter: true,
            title: i18n.deleteItem || 'Delete item',
            description: m(LayoutForm, {
              form: type as UIForm,
              obj: items[state.curItemIdx] as Record<string, any>,
              context: context instanceof Array ? [obj, ...context] : [obj, context],
              section,
              containerId,
              readonly: true,
              i18n,
            }),
            buttons: [
              {
                label: i18n.disagree || 'Disagree',
              },
              {
                label: i18n.agree || 'Agree',
                onclick: () => {
                  if (typeof state.curItemIdx !== 'undefined') {
                    items.splice(state.curItemIdx, 1);
                    if (obj instanceof Array) {
                      obj = [...items];
                    } else {
                      obj[id] = [...items];
                    }
                    notify(obj);
                  }
                },
              },
            ],
          }),
        typeof type === 'string' || typeof type === 'undefined'
          ? undefined
          : m(ModalPanel, {
              onCreate: (modal) => (state.editModal = modal),
              id: editId,
              title: state.editItem ? state.editLabel : state.createLabel,
              fixedFooter: true,
              description: m(
                '.row.form-item',
                m(LayoutForm, {
                  key: modalKey,
                  form: type,
                  i18n,
                  obj: state.editItem || state.newItem || {},
                  onchange: (isValid) => (state.canSave = isValid),
                  context: context instanceof Array ? [obj, ...context] : [obj, context],
                  containerId,
                  disabled,
                })
              ),
              buttons: [
                {
                  iconName: 'cancel',
                  label: i18n.cancel || 'Cancel',
                },
                {
                  iconName: 'save',
                  label: i18n.save || 'Save',
                  disabled: !state.canSave,
                  onclick: () => {
                    if (state.editItem && typeof state.curItemIdx !== 'undefined') {
                      const edited = state.editItem;
                      const current = state.curItemIdx;
                      type.forEach((f) => {
                        if (f.id) {
                          (current as any)[f.id] = edited[f.id];
                        }
                      });
                    } else if (state.newItem) {
                      items.push(state.newItem);
                    }
                    notify(obj);
                  },
                },
              ],
            }),
      ];
    },
  };
};
