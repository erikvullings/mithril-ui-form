import { UIForm } from 'mithril-ui-form-plugin';
import { isValid } from '../src/components/layout-form';

describe('Nested form validity (isValid)', () => {
  it('reports valid when a top-level required field is filled in', () => {
    const form: UIForm<{ name?: string }> = [{ id: 'name', type: 'text', label: 'Name', required: true }];
    expect(isValid({ name: 'Alice' }, form)).toBe(true);
  });

  it('reports invalid when a top-level required field is missing', () => {
    const form: UIForm<{ name?: string }> = [{ id: 'name', type: 'text', label: 'Name', required: true }];
    expect(isValid({}, form)).toBe(false);
  });

  it('reports invalid when a required field nested inside an object field is missing', () => {
    interface Address {
      street?: string;
    }
    interface Person {
      name?: string;
      address?: Address;
    }
    const addressForm: UIForm<Address> = [{ id: 'street', type: 'text', label: 'Street', required: true }];
    const form: UIForm<Person> = [
      { id: 'name', type: 'text', label: 'Name', required: true },
      { id: 'address', type: addressForm as any, label: 'Address' },
    ];

    expect(isValid({ name: 'Alice', address: {} }, form)).toBe(false);
    expect(isValid({ name: 'Alice', address: { street: 'Main St' } }, form)).toBe(true);
    // No address at all is fine: the nested `street` requirement only kicks in once the object exists.
    expect(isValid({ name: 'Alice' }, form)).toBe(true);
  });

  it('reports invalid when a required field nested inside a repeated item is missing', () => {
    interface Item {
      title?: string;
    }
    interface Parent {
      items?: Item[];
    }
    const itemForm: UIForm<Item> = [{ id: 'title', type: 'text', label: 'Title', required: true }];
    const form: UIForm<Parent> = [{ id: 'items', type: itemForm as any, label: 'Items', repeat: true } as any];

    expect(isValid({ items: [{ title: 'ok' }, {}] }, form)).toBe(false);
    expect(isValid({ items: [{ title: 'ok' }, { title: 'also ok' }] }, form)).toBe(true);
    expect(isValid({ items: [] }, form)).toBe(true);
  });
});
