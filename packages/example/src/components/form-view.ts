import m from 'mithril';
import { LayoutForm, Form, SlimdownView } from 'mithril-ui-form';
import { TextArea } from 'mithril-materialized';

export interface IContext {
  admin: boolean;
}

/** Relevant context for the Form, can be used with show/disabling */
const context = {
  admin: true,
};

interface IEditor {
  name: string;
  role: string;
  organisation: string;
  email: string;
}
interface ISource {
  title: string;
  url: string;
}

interface ILessonLearned {
  id: string;
  event: string;
  description: string;
  categories: string[];
  created: Date;
  edited: Date;
  editors: IEditor[];
  sources?: ISource[];
  // eventDescription: {
  //   riskCategory: {};
  // };
}

const regions = [
  { id: 'eu', label: 'Europe' },
  { id: 'other', label: 'Rest of the world' },
];

const countries = [
  {
    id: 'NL',
    label: 'Nederland',
    show: 'region = eu',
  },
  {
    id: 'B',
    label: 'België',
    show: 'region = eu',
  },
  {
    id: 'D',
    label: 'Duitsland',
    show: 'region = eu',
  },
  {
    id: 'US',
    label: 'United States',
    show: 'region = other',
  },
  {
    id: 'SA',
    label: 'South America',
    show: 'region = other',
  },
];

const editorType = {
  label: 'Editors',
  repeat: 0,
  type: {
    id: { autogenerate: 'id' },
    name: { label: 'Name', type: 'text', className: 'col s8', iconName: 'title', required: true },
    role: { label: 'Role', type: 'text', className: 'col s4' },
    region: { label: 'Region', type: 'select', options: regions, className: 'col s6' },
    country: { label: 'Country', type: 'select', options: countries, className: 'col s6', disabled: '!region' },
  },
  // xxx: [
  //   {
  //     id: 'id',
  //     autogenerate: 'id',
  //   },
  //   {
  //     id: 'name',
  //     label: 'Name',
  //     component: 'text',
  //     className: 'col s8',
  //     iconName: 'title',
  //     required: true,
  //   },
  //   {
  //     id: 'role',
  //     label: 'Role',
  //     component: 'text',
  //     className: 'col s4',
  //   },
  // ],
};
//   name: { type: 'text', maxLength: 80, required: true, className: 'col.s6' },
//   role: { type: 'text', maxLength: 20 },
// } as Form<IEditor>;

const source = {
  title: { label: 'Title', type: 'text', maxLength: 80, required: true, icon: 'title' },
  url: { label: 'URL', type: 'url', maxLength: 80, required: true },
} as Form<ISource, IContext>;

const info = {
  intro: { type: 'md', value: `#### Introduction

You can also include _markdown_ in your form.` },
  id: { type: 'text', disabled: true, autogenerate: 'guid', required: true, className: 'col m6' },
  event: { type: 'text', maxLength: 80, required: true, className: 'col m6' },
  categories: { type: 'tags' },
  description: { type: 'textarea', maxLength: 500, required: false, icon: 'note', show: 'event' },
  created: { type: 'date', required: true },
  edited: { type: 'date', required: true },
  editors: editorType,
  sources: {
    type: {
      title: { type: 'text', maxLength: 80, required: true, icon: 'title' },
      url: { type: 'url', maxLength: 80, required: true },
    },
  },
} as Form<ILessonLearned, IContext>;

export const FormView = () => {
  const state = {
    result: {} as ILessonLearned,
    schema: '',
    error: '',
  };

  const print = (isValid: boolean) => {
    console.log(`Form is valid: ${isValid}`);
    console.log(JSON.stringify(state.result, null, 2));
  };

  state.result = {
    id: '31a0f2b7-522a-4d3e-bd6f-69d4507247e6',
    created: new Date('2019-06-01T22:00:00.000Z'),
    edited: new Date('2019-06-08T22:00:00.000Z'),
    editors: [],
    categories: [
      'test',
      'me',
    ],
    event: 'Test me event',
    description: 'My improved description',
  } as ILessonLearned;

  return {
    view: () => {
      const { result } = state;
      // const ui = formFactory(info, result, print);
      return m('.row', [
        m('.col.s6', [
          m('h3', 'Schema'),
          m(TextArea, {
            label: 'JSON form',
            onchange: (value: string) => (state.schema = value),
          }),
          m(SlimdownView, { md: '# Hello world '}),
          state.error ? m('p', m('em.red', state.error)) : undefined,
        ]),
        m('.col.s6', [
          m('h3', 'Generated Form'),
          m('div', m(LayoutForm, { form: info, obj: result, onchange: print, context })),
        ]),
      ]);
    },
  };
};
