import m, { Attributes, Component } from 'mithril';
import { FlatButton, ModalPanel, Pagination, RoundIconButton, TextInput } from 'mithril-materialized';
import { FormAttributes, I18n, InputField } from 'mithril-ui-form-plugin';
import { LayoutForm } from './layout-form';
import { range, stripSpaces, hash, getAllUrlParams, toQueryString, getQueryParamById } from '../utils';
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
    onNewItem?: (obj: O, id?: keyof O, index?: number) => Partial<O[keyof O]>;
  };

  const getItems = (obj: O, id: keyof O): Array<any> => {
    if (obj instanceof Array) {
      return obj;
    } else {
      if (!obj.hasOwnProperty(id) || !Array.isArray(obj[id])) {
        obj[id] = [] as O[keyof O];
      }
      return obj[id];
    }
  };

  const addEmptyItem = (obj: O, id: keyof O) => {
    const index = obj instanceof Array ? obj.length : obj.hasOwnProperty(id) ? obj[id].length : 0;
    const newItem = state.onNewItem ? state.onNewItem(obj, id, index) : ({} as O[keyof O]);
    if (obj instanceof Array) {
      obj.push(newItem);
    } else {
      if (!obj.hasOwnProperty(id) || !Array.isArray(obj[id])) {
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

  const handleDragStart = (event: DragEvent, index: number) => {
    event.dataTransfer?.setData('text/plain', index.toString());
  };

  const handleDrop = (event: DragEvent, index: number, obj: O, id: keyof O, onchange?: (obj: O) => void) => {
    const draggedIndex = parseInt(event.dataTransfer?.getData('text') || '0', 10);
    const newItems: any = [...obj[id]];
    const [movedItem] = newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, movedItem);
    obj[id] = newItems;
    onchange && onchange(obj);
    event.preventDefault();
  };

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault();
  };

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
        className = field.className || 'col s12',
        section,
        containerId,
        disabled = typeof field.disabled === 'boolean' ? field.disabled : undefined,
        readonly: r,
        i18n = {},
        onchange,
      },
    }) => {
      const { filterValue } = state;
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
      const allItems = getItems(obj, id!);
      const strippedFilterValue = filterValue ? stripSpaces(filterValue) : undefined;
      const items =
        propertyFilter && strippedFilterValue && strippedFilterValue.length > 2
          ? allItems.filter((o) => stripSpaces(`${o[propertyFilter]}`).indexOf(strippedFilterValue) >= 0)
          : allItems;
      const queryParam = getQueryParamById(String(id));
      const page = queryParam ? Math.min(items.length, +queryParam) : 1;
      const curPage = pageSize && items && (page - 1) * pageSize < items.length ? page : 1;
      const delimitter = pageSize
        ? (_: any, i: number) => (curPage - 1) * pageSize <= i && i < curPage * pageSize
        : () => true;
      const route = m.route.get() || location.href.replace(location.origin, '').replace('/#!', '');
      const maxPages = pageSize ? Math.ceil(items.length / pageSize) : 0;
      const maxItemsReached = max && items.length >= max ? true : false;
      const canDeleteItems = disabled || readonly ? false : !min || items.length > min ? true : false;

      const fragment = route ? route.split('?')[0] : '';
      const params = getAllUrlParams(route);
      const numberColWidth = 30 + 10 * Math.floor(Math.log10(items.length));

      const canDrag = maxPages === 0;

      // console.log('Items', items);
      return [
        [
          m(
            'div',
            {
              id: String(id),
              className: 'mui-repeat-list ' + className,
            },
            [
              m(
                '.row.mui-repeat-list-controls',
                m('.col.s12', [
                  m(FlatButton, {
                    iconName: disabled || readonly || maxItemsReached ? '' : 'add',
                    iconClass: 'right',
                    label,
                    onclick: () => {
                      addEmptyItem(obj, String(id));
                      if (id) {
                        m.route.set(fragment, Object.assign(params, { [id]: items.length }));
                      }
                      onchange && onchange(obj);
                    },
                    style: { padding: 0 },
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
                  .map((item, index) =>
                    m(
                      '.mui-repeat-item',
                      {
                        key: index,
                        draggable: canDrag,
                        ondragstart: canDrag ? (event: DragEvent) => handleDragStart(event, index) : undefined,
                        ondragover: canDrag ? handleDragOver : undefined,
                        ondrop: canDrag
                          ? (event: DragEvent) => handleDrop(event, index, obj, id!, onchange)
                          : undefined,
                        style: {
                          display: 'flex',
                          cursor: canDrag ? 'move' : undefined,
                        },
                      },
                      [
                        canDeleteItems && [
                          (!pageSize || pageSize > 1) &&
                            m(
                              'span.mui-show-item-number left',
                              { style: `flex: 0 0 ${numberColWidth}px;` },
                              `[${(pageSize ? (curPage - 1) * pageSize + index : index) + 1}]`
                            ),
                        ],
                        [
                          m(
                            '.row.repeat-item',
                            { className: repeatItemClass, key: page + hash(item), style: 'flex: 1;' },
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
                            iconName: 'delete',
                            className: 'mui-delete-item',
                            iconClass: 'mui-delete-icon',
                            style: { flex: '0 0 20px', padding: 0 },
                            disabled,
                            readonly,
                            onclick: () => {
                              state.curItemIdx = pageSize ? (curPage - 1) * pageSize + index : index;
                            },
                          }),
                        ],
                      ]
                    )
                  ),
              !(disabled || maxItemsReached || readonly || !items || items.length === 0 || pageSize === 1) &&
                m(RoundIconButton, {
                  iconName: 'add',
                  className: 'row mui-add-new-item btn-small right',
                  title: label,
                  style: 'padding: 0; margin-top: -10px; margin-right: -25px',
                  onclick: () => {
                    addEmptyItem(obj, String(id));
                    m.route.set(fragment, Object.assign(params, { [id!]: items.length }));
                    onchange && onchange(obj);
                  },
                }),
            ]
          ),
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
      ];
    },
  } as Component<IRepeatList<O>>;
};
