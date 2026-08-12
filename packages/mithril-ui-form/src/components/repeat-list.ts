import m, { Attributes, Component } from 'mithril';
import { ConfirmButton, FlatButton, Pagination, TextInput } from 'mithril-materialized';
import { FormAttributes, I18n, InputField } from 'mithril-ui-form-plugin';
import { LayoutForm } from './layout-form';
import {
  range,
  stripSpaces,
  getAllUrlParams,
  toQueryString,
  getQueryParamById,
  arrayUtils,
  dragDropUtils,
} from '../utils';

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
    const existing = getItems(obj, id);
    const index = existing.length;
    const newItem = state.onNewItem ? state.onNewItem(obj, id, index) : ({} as O[keyof O]);
    if (obj instanceof Array) {
      // `obj` is itself the array here, so mutation is the only way to propagate the
      // change: there's no property on `obj` to reassign a new array into.
      obj.push(newItem);
    } else {
      obj[id] = arrayUtils.insertAt(existing, index, newItem) as O[keyof O];
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

  const handleDragStart = dragDropUtils.handleDragStart;

  const handleDrop = (event: DragEvent, index: number, obj: O, id: keyof O, onchange?: (obj: O) => void) => {
    const draggedIndex = dragDropUtils.getDragIndex(event, 0);
    obj[id] = arrayUtils.moveItem(obj[id], draggedIndex, index) as O[keyof O];
    onchange && onchange(obj);
    event.preventDefault();
  };

  const handleDragOver = dragDropUtils.handleDragOver;

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
      const maxPages = pageSize ? Math.ceil(items.length / pageSize) : 0;
      const maxItemsReached = max && items.length >= max ? true : false;
      const canDeleteItems = disabled || readonly ? false : !min || items.length > min ? true : false;

      const fragment = location.hash ? location.hash.split('?')[0].replace('#!', '') : '';
      const params = getAllUrlParams(location.hash);
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
                        m.route.set(fragment, Object.assign(params, { [id]: getItems(obj, String(id)).length }));
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
              (() => {
                const visibleItems = items.sort(compareFn).filter(delimitter);
                return visibleItems.map((item, index) =>
                  m(
                    '.mui-repeat-item',
                    {
                      key: `item-${page}-${pageSize ? (curPage - 1) * pageSize + index : index}`,
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
                      m(
                        '.mui-item-side-col',
                        { style: `flex: 0 0 ${numberColWidth}px;` },
                        [
                          m(
                            'span.mui-show-item-number',
                            // always render to reserve space; hide when numbering isn't shown
                            { style: (!pageSize || pageSize > 1) && items.length > 1 ? undefined : { visibility: 'hidden' } },
                            `[${(pageSize ? (curPage - 1) * pageSize + index : index) + 1}]`
                          ),
                          m('.mui-repeat-actions', {}, [
                            canDeleteItems &&
                              m(ConfirmButton, {
                                iconName: 'delete',
                                confirmIconName: 'check',
                                style: { padding: 0 },
                                disabled,
                                readonly,
                                onclick: () => {
                                  const itemIdx = pageSize ? (curPage - 1) * pageSize + index : index;
                                  if (obj instanceof Array) {
                                    obj.splice(itemIdx, 1);
                                  } else {
                                    obj[id as keyof O] = arrayUtils.removeAt(items, itemIdx) as O[keyof O];
                                  }
                                  onchange && onchange(obj);
                                },
                              }),
                            !disabled && !readonly && !maxItemsReached && index === visibleItems.length - 1 &&
                              m(FlatButton, {
                                iconName: 'add',
                                style: { padding: 0 },
                                onclick: () => {
                                  addEmptyItem(obj, String(id));
                                  if (id) {
                                    m.route.set(fragment, Object.assign(params, { [id]: getItems(obj, String(id)).length }));
                                  }
                                  onchange && onchange(obj);
                                },
                              }),
                          ]),
                        ]
                      ),
                      m(
                        '.row.repeat-item',
                        {
                          className: repeatItemClass,
                          style: 'flex: 1;',
                        },
                        [
                          type &&
                            m(LayoutForm, {
                              form: type,
                              obj: item,
                              i18n,
                              context: context instanceof Array ? [obj, ...context] : [obj, context],
                              containerId,
                              disabled,
                              readonly,
                              onchange: () => onchange && onchange(obj),
                            } as FormAttributes<any>),
                        ]
                      ),
                    ]
                  )
                );
              })(),

            ]
          ),
        ],
      ];
    },
  } as Component<IRepeatList<O>>;
};
