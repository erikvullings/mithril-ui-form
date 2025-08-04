import m, { Attributes, Component } from 'mithril';
import { FormAttributes, I18n, UIForm } from 'mithril-ui-form-plugin';
import { FlatButton, RoundIconButton } from 'mithril-materialized';
import { LayoutForm } from './layout-form';
import { uniqueId } from 'mithril-materialized';

export interface IArrayLayoutForm<T extends Record<string, any> = {}> extends Attributes {
  /** The form definition for each array element */
  form: UIForm<T>;
  /** The array of objects to render */
  items: T[];
  /** Callback function, invoked every time the array has changed */
  onchange?: (items: T[]) => void;
  /** Function to create new items */
  createItem?: () => T;
  /** Disable the form, disallowing edits */
  disabled?: boolean;
  /** Disable editing */
  readonly?: boolean;
  /** Localization options */
  i18n?: I18n;
  /** Optional container ID for DatePicker and TimePicker */
  containerId?: string;
  /** Optional label for the array */
  label?: string;
  /** Maximum number of items allowed */
  max?: number;
  /** Minimum number of items required */
  min?: number;
  /** Show item numbers */
  showNumbers?: boolean;
  /** Allow drag and drop reordering */
  allowReorder?: boolean;
  /** Custom CSS class */
  className?: string;
}

/**
 * ArrayLayoutForm - A component that renders a form for arrays of objects
 * Provides top-level array support with add/remove/reorder functionality
 */
export const ArrayLayoutForm = <T extends Record<string, any> = {}>(): Component<IArrayLayoutForm<T>> => {
  const state = {
    dragIndex: -1,
  };

  const createDefaultItem = (): T => ({} as T);

  const handleDragStart = (event: DragEvent, index: number) => {
    state.dragIndex = index;
    event.dataTransfer?.setData('text/plain', index.toString());
  };

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: DragEvent, dropIndex: number, items: T[], onchange?: (items: T[]) => void) => {
    event.preventDefault();
    const dragIndex = parseInt(event.dataTransfer?.getData('text') || '-1', 10);
    
    if (dragIndex === -1 || dragIndex === dropIndex) return;

    const newItems = [...items];
    const [draggedItem] = newItems.splice(dragIndex, 1);
    newItems.splice(dropIndex, 0, draggedItem);
    
    onchange?.(newItems);
    state.dragIndex = -1;
  };

  return {
    view: ({ 
      attrs: { 
        form, 
        items, 
        onchange, 
        createItem = createDefaultItem,
        disabled = false,
        readonly = false,
        i18n = {},
        containerId = 'body',
        label = 'Items',
        max,
        min = 0,
        showNumbers = true,
        allowReorder = true,
        className = 'array-layout-form'
      } 
    }) => {
      const canAdd = !disabled && !readonly && (!max || items.length < max);
      const canRemove = !disabled && !readonly && items.length > min;
      const canDrag = allowReorder && !disabled && !readonly && items.length > 1;

      const addItem = () => {
        if (!canAdd) return;
        const newItem = createItem();
        const newItems = [...items, newItem];
        onchange?.(newItems);
      };

      const removeItem = (index: number) => {
        if (!canRemove) return;
        const newItems = items.filter((_, i) => i !== index);
        onchange?.(newItems);
      };

      const updateItem = (index: number) => (_isValid: boolean, item?: T) => {
        if (!item) return;
        const newItems = [...items];
        newItems[index] = item;
        onchange?.(newItems);
      };

      return m(
        'div',
        { className: `${className} col s12` },
        [
          // Header with add button
          m('.array-form-header.row', [
            m('.col.s6', m('h6', label)),
            canAdd &&
              m(
                '.col.s6.right-align',
                m(FlatButton, {
                  iconName: 'add',
                  iconClass: 'left',
                  label: (i18n as any).add || 'Add Item',
                  onclick: addItem,
                  className: 'add-item-btn',
                })
              ),
          ]),

          // Items
          items.length === 0
            ? m('.empty-state.center-align', [
                m('p.grey-text', (i18n as any).noItems || 'No items yet'),
                canAdd &&
                  m(RoundIconButton, {
                    iconName: 'add',
                    onclick: addItem,
                    className: 'btn-large',
                    title: (i18n as any).addFirst || 'Add first item',
                  }),
              ])
            : items.map((item, index) =>
                m(
                  '.array-item.card',
                  {
                    key: `item-${index}-${uniqueId()}`,
                    draggable: canDrag,
                    ondragstart: canDrag ? (event: DragEvent) => handleDragStart(event, index) : undefined,
                    ondragover: canDrag ? handleDragOver : undefined,
                    ondrop: canDrag
                      ? (event: DragEvent) => handleDrop(event, index, items, onchange)
                      : undefined,
                    style: {
                      cursor: canDrag ? 'move' : 'default',
                      marginBottom: '1rem',
                    },
                  },
                  [
                    m('.card-content', [
                      // Item header with number and remove button
                      m('.row.item-header', [
                        showNumbers &&
                          m('.col.s2', [
                            m('span.item-number.badge', `${index + 1}`),
                          ]),
                        m('.col', {
                          class: showNumbers ? 's8' : 's10',
                        }),
                        canRemove &&
                          m(
                            '.col.s2.right-align',
                            m(FlatButton, {
                              iconName: 'delete',
                              iconClass: 'red-text',
                              onclick: () => removeItem(index),
                              className: 'remove-item-btn',
                              title: (i18n as any).remove || 'Remove item',
                            })
                          ),
                      ]),

                      // Form content
                      m('.row.item-content', [
                        m(LayoutForm<T>(), {
                          form,
                          obj: item,
                          onchange: updateItem(index),
                          disabled,
                          readonly,
                          i18n,
                          containerId,
                        } as FormAttributes<T>),
                      ]),
                    ]),
                  ]
                )
              ),

          // Footer add button for non-empty lists
          items.length > 0 &&
            canAdd &&
            m(
              '.array-form-footer.center-align',
              { style: 'margin-top: 1rem' },
              m(RoundIconButton, {
                iconName: 'add',
                onclick: addItem,
                title: (i18n as any).addAnother || 'Add another item',
              })
            ),
        ]
      );
    },
  };
};