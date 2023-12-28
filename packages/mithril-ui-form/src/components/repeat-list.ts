import m, { Attributes, Component } from 'mithril';
import { FlatButton, uniqueId, ModalPanel, Pagination, RoundIconButton, TextInput } from 'mithril-materialized';
import { FormAttributes, I18n, InputField } from 'mithril-ui-form-plugin';
import { LayoutForm } from './layout-form';
import { range, stripSpaces, hash, getAllUrlParams, toQueryString } from '../utils';
import { Modal } from 'materialize-css';

export interface IRepeatList<O extends Attributes = {}> extends Attributes {
  id?: keyof O;
  /** The input field (or form) that must be rendered repeatedly */
  field: InputField<O>;
  /** The result object */
  obj: O;
  /** The context */
  context: Array<O | O[keyof O]>;
  /** Callback function, invoked every time the original result object has changed */
  onchange?: (result: O) => void;
  /** Section ID to display - can be used to split up the form and only show a part */
  section?: string;
  /** Translation keys, read once on initialization */
  i18n?: Partial<I18n>;
  /** Optional container ID for DatePicker and TimePicker to render their content in */
  containerId?: string;
  /** If true, the repeat component is disabled, and adding, deleting or editing items is prohibited */
  disabled?: boolean;
  className?: string;
  readonly?: boolean;
}

/**
 * A component that is a wrapper around another component, allowing the creation of new items,
 * and its items can be edited or deleted.
 *
 * It creates an array of primitives when type is a IFormComponent, and an array of objects when its type
 * is a FormType.
 */
// export const RepeatList = <O extends Attributes = {}, K extends keyof O = ''>(): Component<IRepeatList<O>> => {
// export const RepeatList = <O extends Attributes, S = {}>() => {
export const RepeatList = <O extends Attributes>() => {
  const state = {} as {
    editItem?: O;
    curItemIdx?: number;
    newItem?: O;
    canSave?: boolean;
    editModal?: M.Modal;
    modalKey?: string;
    editLabel: string;
    createLabel: string;
    /** When dealing with a large list, you may add a property filter */
    filterValue?: string;
    onNewItem?: (obj: O, id?: keyof O) => O[keyof O];
  };

  const getItems = (obj: O, id: keyof O): Array<any> => {
    if (obj instanceof Array) {
      return obj;
    } else {
      if (!obj.hasOwnProperty(id)) {
        obj[id] = [] as O[keyof O];
      }
      return obj[id];
    }
  };

  const addEmptyItem = (obj: O, id: keyof O) => {
    const newItem = state.onNewItem ? state.onNewItem(obj, id) : ({} as O[keyof O]);
    if (obj instanceof Array) {
      obj.push(newItem);
    } else {
      if (!obj.hasOwnProperty(id)) {
        obj[id] = [newItem] as O[keyof O];
      } else {
        obj[id].push(newItem);
      }
    }
  };

  const compareFnFactory = (sortProperty?: string) => {
    if (!sortProperty) {
      return (_a: O, _b: O) => 0;
    }
    const reverse = sortProperty[0] === '!';
    const key = reverse ? sortProperty.substring(1) : sortProperty;

    return reverse
      ? (a: O, b: O) => (a[key] > b[key] ? -1 : a[key] < b[key] ? 1 : 0)
      : (a: O, b: O) => (a[key] > b[key] ? 1 : a[key] < b[key] ? -1 : 0);
  };

  let compareFn: (a: O, b: O) => number;

  return {
    oninit: ({
      attrs: {
        i18n = {},
        field: { id = '', sortProperty, onNewItem },
      },
    }) => {
      state.editLabel = i18n.editRepeat || `Edit ${String(id)}`;
      state.createLabel = i18n.createRepeat || `Create new ${String(id)}`;
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
      const { modalKey, filterValue } = state;
      const {
        id,
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
      const allItems = getItems(obj, id!);
      const strippedFilterValue = filterValue ? stripSpaces(filterValue) : undefined;
      const items =
        propertyFilter && strippedFilterValue && strippedFilterValue.length > 2
          ? allItems.filter((o) => stripSpaces(`${o[propertyFilter]}`).indexOf(strippedFilterValue) >= 0)
          : allItems;
      const page = m.route.param(String(id)) ? Math.min(items.length, +m.route.param(String(id))) : 1;
      const curPage = pageSize && items && (page - 1) * pageSize < items.length ? page : 1;
      const delimitter = pageSize
        ? (_: any, i: number) => (curPage - 1) * pageSize <= i && i < curPage * pageSize
        : () => true;
      const route = m.route.get();
      const maxPages = pageSize ? Math.ceil(items.length / pageSize) : 0;
      const maxItemsReached = max && items.length >= max ? true : false;
      const canDeleteItems = disabled ? false : !min || items.length > min ? true : false;

      const fragment = route ? route.split('?')[0] : '';
      const params = getAllUrlParams(route);

      return [
        [
          m(`#${String(id)}.mui-repeat-list${className}`, [
            m(
              '.row.mui-repeat-list-controls',
              m('.col.s12', [
                m(FlatButton, {
                  iconName: disabled || maxItemsReached ? '' : 'add',
                  iconClass: 'right',
                  label,
                  onclick: () => {
                    addEmptyItem(obj, String(id));
                    if (id) m.route.set(fragment, Object.assign(params, { [id]: items.length }));
                    onchange && onchange(obj);
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
                        href: toQueryString(fragment, params, { [id!]: i }),
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
                .map((item, i) =>
                  m('.mui-repeat-item', { style: 'display: flex;' }, [
                    canDeleteItems && [
                      (!pageSize || pageSize > 1) &&
                        m(
                          'span.mui-show-item-number left',
                          { style: 'flex: 0 0 auto;' },
                          `[${(pageSize ? (curPage - 1) * pageSize + i : i) + 1}]`
                        ),
                    ],
                    [
                      m(
                        '.row.repeat-item',
                        { className: repeatItemClass, key: page + hash(item), style: 'flex: 1; padding: 0 15px' },
                        [
                          type &&
                            m(LayoutForm, {
                              form: type,
                              obj: item,
                              i18n,
                              context: context instanceof Array ? [obj, ...context] : [obj, context],
                              section,
                              containerId,
                              disabled,
                              readonly,
                              onchange: () => onchange && onchange(obj),
                            } as FormAttributes),
                        ]
                      ),
                    ],
                    canDeleteItems && [
                      m(FlatButton, {
                        type: 'button',
                        iconName: 'clear',
                        iconClass: 'white black-text',
                        className: 'row mui-delete-item btn-small',
                        style: 'flex: 0 0 auto;',
                        disabled,
                        readonly,
                        onclick: () => {
                          state.curItemIdx = pageSize ? (curPage - 1) * pageSize + i : i;
                        },
                      }),
                    ],
                  ])
                ),
            !(disabled || maxItemsReached || readonly || !items || items.length === 0 || pageSize === 1) &&
              m(RoundIconButton, {
                type: 'button',
                iconName: 'add',
                iconClass: 'white black-text',
                className: 'row mui-add-new-item btn-small right',
                title: label,
                style: 'padding: 0; margin-top: -10px; margin-right: -25px',
                onclick: () => {
                  addEmptyItem(obj, String(id));
                  m.route.set(fragment, Object.assign(params, { [id!]: items.length }));
                  onchange && onchange(obj);
                },
              }),
          ]),
        ],
        typeof state.curItemIdx !== 'undefined' &&
          m(ModalPanel, {
            id: 'deleteItem',
            onCreate: (modal: Modal) => modal.open(),
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
              form: type,
              obj: items[state.curItemIdx] as O[keyof O],
              context: context instanceof Array ? [obj, ...context] : [obj, context],
              section,
              containerId,
              readonly: true,
              i18n,
            } as FormAttributes),
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
                      obj = [...items] as O[keyof O];
                    } else {
                      obj[id as keyof O] = [...items] as O[keyof O];
                    }
                    onchange && onchange(obj);
                  }
                },
              },
            ],
          }),
        // TODO Check this code - do we ever get here
        typeof type === 'string' || typeof type === 'undefined'
          ? undefined
          : m(ModalPanel, {
              onCreate: (modal: Modal) => (state.editModal = modal),
              id: editId,
              title: state.editItem ? state.editLabel : state.createLabel,
              fixedFooter: true,
              description: m(
                '.row.form-item',
                m(LayoutForm, {
                  key: modalKey,
                  form: type,
                  i18n,
                  obj: state.editItem || state.newItem || ({} as O[keyof O]),
                  onchange: (isValid) => (state.canSave = isValid),
                  context: context instanceof Array ? [obj, ...context] : [obj, context],
                  containerId,
                  disabled,
                } as FormAttributes)
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
                          // TODO Check this code - a number is being indexed?
                          (current as any)[f.id] = (edited as any)[f.id];
                        }
                      });
                    } else if (state.newItem) {
                      items.push(state.newItem);
                    }
                    onchange && onchange(obj);
                  },
                },
              ],
            }),
      ];
    },
  } as Component<IRepeatList<O>>;
};
