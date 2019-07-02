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
  region: string;
  country: string;
}
interface ISource {
  title: string;
  url: string;
}

interface ILessonLearned {
  id: string;
  event: string;
  /** GeoJSON area definition */
  area: { [key: string]: any };
  description: string;
  categories: string[]; // TODO Allow the user to specify defaults
  created: Date;
  edited: Date;
  editors: IEditor[];
  sources?: ISource[];
}

const regions = [{ id: 'eu', label: 'Europe' }, { id: 'other', label: 'Rest of the world' }];

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
};

const source = {
  title: { label: 'Title', type: 'text', maxLength: 80, required: true, icon: 'title', className: 'col s4' },
  url: { label: 'URL', type: 'url', maxLength: 80, required: true, icon: 'link', className: 'col s8' },
} as Form<ISource, IContext>;

const info = {
  intro: {
    type: 'md',
    value: `#### Introduction

You can also include _markdown_ in your form.`,
  },
  id: { type: 'text', disabled: true, autogenerate: 'guid', required: true, className: 'col m6' },
  event: { type: 'text', maxLength: 80, required: true, className: 'col m6' },
  area: { type: 'map', required: true, className: 'col s12' },
  categories: { type: 'tags' },
  description: { type: 'textarea', maxLength: 500, required: false, icon: 'note', show: 'event' },
  created: { label: 'Created "{{event}}" event on:', type: 'date', required: true },
  edited: { type: 'date', required: true },
  editors: editorType,
  sources: {
    label: 'Input sources',
    repeat: 0,
    type: source,
  },
} as Form<ILessonLearned, IContext>;

export const FormView = () => {
  const state = {
    result: {} as ILessonLearned,
    isValid: false,
    form: {},
    error: '',
  };

  const print = (isValid: boolean) => {
    state.isValid = isValid;
    console.log(`Form is valid: ${isValid}`);
    console.log(JSON.stringify(state.result, null, 2));
  };

  state.form = info;

  state.result = {
    id: '31a0f2b7-522a-4d3e-bd6f-69d4507247e6',
    created: new Date('2019-06-01T22:00:00.000Z'),
    edited: new Date('2019-06-08T22:00:00.000Z'),
    categories: ['test', 'me'],
    event: 'Test me event',
    description: 'My improved description',
    editors: [
      {
        name: 'Erik Vullings',
        role: 'Being myself',
        region: 'eu',
        country: 'NL',
      },
    ],
    area: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Point',
            coordinates: [4.327293, 52.110118],
          },
        },
      ],
    },
    // sources: [
    //   {
    //     title: 'Google',
    //     url: 'https://www.google.nl',
    //   },
    // ],
  } as ILessonLearned;

  return {
    view: () => {
      const { result, isValid, form } = state;
      const md = `
# MITHRIL-UI-FORM

This library converts a JSON description to a form, allowing you to:

1. Quickly create GUI forms without the normal hassle.
1. Comes with basic validation support (it checks whether all required properties are specified).
1. The form also supports **arrays of objects or strings**.
1. Can optionally **hide** and **disable** elements using the \`show\` property, which can contain one or more expressions. See the editors array.
1. Can contain **placeholders**, e.g. {{ event }}, which will be replaced by the value of \`event\`.
1. Can **generate IDs automatically** (of type \`GUID\` or a shorter version).
1. Upon changes, the result object is updated.

## Use cases

While creating this, I had the following use cases in mind:

1. I'm currently working on a [scenario editor](https://github.com/DRIVER-EU/scenario-manager), which requires me to define a GUI for each message that can be send. Preferably, I would like to use a JSON form that will generate the GUI for me, so I can quickly add new message types.
2. I'm also working on a [Lessons' Learned Framework](https://github.com/DRIVER-EU) (LLF, a GUI with lesson's learned stored in a database). Since different organisations will have different kinds of lessons, it is easier if I make the LLF agnostic for the specific kind of form.
3. A slight adaptation of the previous is an online questionnaire: Although there are many open or paid alternatives, like SurveyMonkey or Google Forms, they require you to host your service online. However, when security is important, this may not be an option, so it is better to host it locally on your Intranet or within your VPN.
4. Yet another project involves a [specification editor](https://github.com/TNOCS/spec-tool): The end user specifies the form, and a specification object is generated. This generated object is processed and rendered to a document. Features I still need to implement are presets, support for a map, and output generation.

## Playground

At the left, you see the generated form. At the right, you see the resulting object, and the life schema (which you can edit).`;

      const md2 = isValid
        ? `
# Generated result

This form was created on ${result.created.toLocaleDateString()} by the following editors:

${result.editors && result.editors.map((e, i) => `${i + 1}. ${e.name}${e.role ? ` (${e.role})` : ''}`).join('\n')}

## Input sources
${result.sources ? result.sources.map((s, i) => `${i + 1}. [${s.title}](${s.url})`).join('\n') : ''}
      `
        : '**Warning** _form is invalid!_ Please edit me.';

      // const ui = formFactory(info, result, print);
      return m('.row', [
        m('.col.s12', m(SlimdownView, { md })),
        m('.col.s6.l4', [
          m('h3', 'Generated Form'),
          m('div', m(LayoutForm, { form, obj: result, onchange: print, context })),
        ]),
        m('.col.s6.l4', [
          m('h3', 'Resulting object'),
          m('pre', JSON.stringify(result, null, 2)),
          m(SlimdownView, { md: md2 }),
        ]),
        m('.col.s6.l4', [
          m('h3', 'Life schema'),
          m(TextArea, {
            label: 'JSON form',
            initialValue: JSON.stringify(form, null, 2),
            // disabled: true,
            onchange: (value: string) => (state.form = JSON.parse(value)),
          }),
          state.error ? m('p', m('em.red', state.error)) : undefined,
        ]),
      ]);
    },
  };
};
