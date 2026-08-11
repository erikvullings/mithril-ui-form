import m from 'mithril';
import { UIForm } from 'mithril-ui-form-plugin';
import { ArrayLayoutForm } from '../src/components/array-layout-form';

/**
 * Renders ArrayLayoutForm for real (jsdom) and drives it through actual DOM events,
 * so these tests exercise the runtime add/remove/reorder path (now backed by
 * arrayUtils) rather than arrayUtils in isolation.
 */
describe('ArrayLayoutForm array mutation (runtime path)', () => {
  interface Item {
    name?: string;
  }

  const form: UIForm<Item> = [{ id: 'name', type: 'text', label: 'Name' }];

  let root: HTMLElement;

  beforeEach(() => {
    root = document.createElement('div');
    document.body.appendChild(root);
  });

  afterEach(() => {
    m.mount(root, null);
    root.remove();
  });

  it('adds a new item via arrayUtils.insertAt on the runtime path', () => {
    const items: Item[] = [{ name: 'a' }];
    let received: Item[] | undefined;

    m.mount(root, {
      view: () =>
        m(ArrayLayoutForm<Item>(), {
          form,
          items,
          onchange: (_isValid: boolean, newItems?: Item[]) => {
            received = newItems;
          },
        }),
    });

    const addButton = root.querySelector('.add-item-btn') as HTMLElement;
    expect(addButton).toBeTruthy();
    addButton.click();

    expect(received).toEqual([{ name: 'a' }, {}]);
  });

  it('removes an item via arrayUtils.removeAt on the runtime path', () => {
    const items: Item[] = [{ name: 'a' }, { name: 'b' }];
    let received: Item[] | undefined;

    m.mount(root, {
      view: () =>
        m(ArrayLayoutForm<Item>(), {
          form,
          items,
          onchange: (_isValid: boolean, newItems?: Item[]) => {
            received = newItems;
          },
        }),
    });

    const removeButton = root.querySelector('.remove-item-btn') as HTMLElement;
    expect(removeButton).toBeTruthy();
    removeButton.click();

    expect(received).toEqual([{ name: 'b' }]);
  });

  it('reorders items via arrayUtils.moveItem on drag-and-drop', () => {
    const items: Item[] = [{ name: 'a' }, { name: 'b' }, { name: 'c' }];
    let received: Item[] | undefined;

    m.mount(root, {
      view: () =>
        m(ArrayLayoutForm<Item>(), {
          form,
          items,
          onchange: (_isValid: boolean, newItems?: Item[]) => {
            received = newItems;
          },
        }),
    });

    const cards = root.querySelectorAll('.array-item.card');
    expect(cards.length).toBe(3);

    const dataTransfer = {
      data: {} as Record<string, string>,
      setData(type: string, value: string) {
        this.data[type] = value;
      },
      getData(type: string) {
        return this.data[type];
      },
    };

    const dragStartEvent = new Event('dragstart', { bubbles: true }) as any;
    dragStartEvent.dataTransfer = dataTransfer;
    cards[0].dispatchEvent(dragStartEvent);

    const dropEvent = new Event('drop', { bubbles: true, cancelable: true }) as any;
    dropEvent.dataTransfer = dataTransfer;
    cards[2].dispatchEvent(dropEvent);

    expect(received).toEqual([{ name: 'b' }, { name: 'c' }, { name: 'a' }]);
  });
});
