import m from 'mithril';
import { LayoutForm, registerPlugin, UIForm, SlimdownView, I18n, render } from 'mithril-ui-form';
import { TextArea } from 'mithril-materialized';
import { leafletPlugin } from 'mithril-ui-form-leaflet-plugin';
import { ratingPlugin } from 'mithril-ui-form-rating-plugin';

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
  id: 'editors',
  label: 'Editors',
  repeat: 0,
  type: [
    { id: 'id', autogenerate: 'id' },
    { id: 'name', label: 'Name', type: 'text', className: 'col s8', iconName: 'title', required: true },
    { id: 'role', label: 'Role', type: 'text', className: 'col s4' },
    { id: 'region', label: 'Region', type: 'select', options: regions, className: 'col s6' },
    { id: 'country', label: 'Country', type: 'select', options: countries, className: 'col s6', disabled: '!region' },
  ],
};

const source = [
  { id: 'title', label: 'Title', type: 'text', maxLength: 80, required: true, icon: 'title', className: 'col s4' },
  { id: 'url', label: 'URL', type: 'url', maxLength: 80, required: true, icon: 'link', className: 'col s8' },
] as UIForm;

const info = [
  {
    id: 'geojson',
    label: 'GeoJSON editor',
    description: '_My desc!_',
    repeat: 'geojson',
    onSelect: (i: number) => alert(i),
    type: [
      {
        id: 'title',
        type: 'text',
        className: 'col s9',
        required: true,
      },
      {
        id: 'id',
        type: 'text',
        readonly: true,
        autogenerate: 'id',
        className: 'col s3',
        required: true,
      },
      {
        id: 'description',
        type: 'textarea',
        required: true,
      },
    ] as UIForm,
  },
] as UIForm;

const info2 = [
  {
    id: 'my_rating',
    label: 'What do you think of this plugin?',
    description: '_Please, be honest!_',
    type: 'rating',
    min: 0,
    max: 5,
    ratings: { '0': 'extremely<br>bad', '5': 'super<br>good' },
  },
  {
    id: 'my_rating',
    label: '',
    disabled: true,
    type: 'rating',
    min: 0,
    max: 5,
  },
  {
    id: 'intro',
    type: 'md',
    value: `#### Introduction

You can also include _markdown_ in your UIForm.`,
  },
  { id: 'id', type: 'text', disabled: true, autogenerate: 'guid', required: true, className: 'col m6' },
  { id: 'event', type: 'text', maxLength: 80, required: true, className: 'col m6' },
  { id: 'area', type: 'map', required: true, className: 'col s12' },
  { id: 'categories', type: 'tags' },
  { id: 'description', type: 'textarea', maxLength: 500, required: false, icon: 'note', show: 'event' },
  { id: 'created', label: 'Created "{{event}}" event on:', type: 'date', required: true },
  { id: 'edited', type: 'date', required: true },
  editorType,
  {
    id: 'sources',
    label: 'Input sources',
    repeat: 0,
    type: source,
  },
] as UIForm;

export const FormView = () => {
  registerPlugin('map', leafletPlugin);
  registerPlugin('rating', ratingPlugin);

  const state = {
    result: {} as ILessonLearned,
    isValid: false,
    form: [] as UIForm,
    error: '',
  };

  const print = (isValid: boolean) => {
    state.isValid = isValid;
    console.log(`Form is ${isValid ? '' : 'in'}valid.`);
    console.log(JSON.stringify(state.result, null, 2));
  };

  state.form = info;

  state.result = {
    my_rating: 5,
    id: '31a0f2b7-522a-4d3e-bd6f-69d4507247e6',
    created: new Date('2019-06-01T22:00:00.000Z'),
    edited: new Date('2019-06-08T22:00:00.000Z'),
    categories: ['test', 'me'],
    event: 'Test me event',
    description: 'Only show when `event` is specified.',
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
      const md2 = isValid
        ? `
# Generated result

This form was created on ${new Date(result.created).toLocaleDateString()} by the following editors:

${result.editors && result.editors.map((e, i) => `${i + 1}. ${e.name}${e.role ? ` (${e.role})` : ''}`).join('\n')}

## Input sources
${result.sources ? result.sources.map((s, i) => `${i + 1}. [${s.title}](${s.url})`).join('\n') : ''}
      `
        : '**Warning** _form is invalid!_ Please edit me.';

      // const ui = formFactory(info, result, print);
      return m('.row', [
        m('.col.s12.m4', [
          m(SlimdownView, {
            md: `##### JSON FORM

          Feel free to edit me.`,
          }),
          m(TextArea, {
            label: 'JSON form',
            helperText: render('_Switch to another element to show the result._'),
            initialValue: JSON.stringify(form, null, 2),
            onchange: (value: string) => {
              state.form = JSON.parse(value);
              state.result = {} as any;
            },
          }),
          state.error ? m('p', m('em.red', state.error)) : undefined,
        ]),
        m('.col.s12.m8', [
          m('h5', 'Generated Form'),
          m(
            '.row',
            m(LayoutForm, {
              form,
              obj: result,
              onchange: print,
              context,
              i18n: {
                deleteItem: 'Verwijder het item',
                agree: 'Ja',
                disagree: 'Nee',
              } as I18n,
            })
          ),
        ]),
        m('.col.s12', [
          m('h5', 'Resulting object'),
          m('pre', JSON.stringify(state.result, null, 2)),
          m(SlimdownView, { md: md2 }),
        ]),
      ]);
    },
  };
};
