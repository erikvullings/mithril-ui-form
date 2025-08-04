import m from 'mithril';
import { ArrayLayoutForm, UIForm } from '../src/index';

// Example data types
interface Person {
  id: string;
  name: string;
  email: string;
  age: number;
}

// Example form definition for a Person
const personForm: UIForm<Person> = [
  {
    id: 'name',
    type: 'text',
    label: 'Full Name',
    required: true,
    placeholder: 'Enter full name',
  },
  {
    id: 'email',
    type: 'email',
    label: 'Email Address',
    required: true,
    placeholder: 'person@example.com',
  },
  {
    id: 'age',
    type: 'number',
    label: 'Age',
    min: 0,
    max: 120,
    placeholder: '25',
  },
];

// Example usage of ArrayLayoutForm
export const ArrayFormExample = () => {
  const state = {
    people: [] as Person[],
  };

  const createPerson = (): Person => ({
    id: `person_${Date.now()}`,
    name: '',
    email: '',
    age: 0,
  });

  return {
    view: () => [
      m('h1', 'Array Form Example'),
      m('p', 'This example demonstrates how to use ArrayLayoutForm for managing arrays of data.'),
      
      m(ArrayLayoutForm<Person>(), {
        form: personForm,
        items: state.people,
        onchange: (items: Person[]) => {
          state.people = items;
          console.log('People updated:', items);
        },
        createItem: createPerson,
        label: 'Team Members',
        min: 0,
        max: 10,
        showNumbers: true,
        allowReorder: true,
        i18n: {
          add: 'Add Person',
          noItems: 'No team members yet',
          addFirst: 'Add first team member',
          remove: 'Remove person',
          addAnother: 'Add another person',
        } as any,
      }),
      
      m('hr'),
      m('h3', 'Current Data:'),
      m('pre', JSON.stringify(state.people, null, 2)),
    ],
  };
};

// Usage example for mounting the component
// m.mount(document.body, ArrayFormExample);