import m from 'mithril';
import { LayoutForm, Form, SlimdownView, IObject } from 'mithril-ui-form';
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

const countries = [
  {
    id: 'n_a',
    label: 'N/A',
  },
  {
    id: 'austria',
    label: 'Austria',
  },
  {
    id: 'belgium',
    label: 'Belgium',
  },
  {
    id: 'bulgaria',
    label: 'Bulgaria',
  },
  {
    id: 'croatia',
    label: 'Croatia',
  },
  {
    id: 'cyprus',
    label: 'Cyprus',
  },
  {
    id: 'czech_republic',
    label: 'Czech Republic',
  },
  {
    id: 'denmark',
    label: 'Denmark',
  },
  {
    id: 'estonia',
    label: 'Estonia',
  },
  {
    id: 'finland',
    label: 'Finland',
  },
  {
    id: 'france',
    label: 'France',
  },
  {
    id: 'germany',
    label: 'Germany',
  },
  {
    id: 'greece',
    label: 'Greece',
  },
  {
    id: 'hungary',
    label: 'Hungary',
  },
  {
    id: 'ireland',
    label: 'Ireland',
  },
  {
    id: 'italy',
    label: 'Italy',
  },
  {
    id: 'latvia',
    label: 'Latvia',
  },
  {
    id: 'lithuania',
    label: 'Lithuania',
  },
  {
    id: 'luxembourg',
    label: 'Luxembourg',
  },
  {
    id: 'malta',
    label: 'Malta',
  },
  {
    id: 'netherlands',
    label: 'Netherlands',
  },
  {
    id: 'poland',
    label: 'Poland',
  },
  {
    id: 'portugal',
    label: 'Portugal',
  },
  {
    id: 'romania',
    label: 'Romania',
  },
  {
    id: 'slovakia',
    label: 'Slovakia',
  },
  {
    id: 'slovenia',
    label: 'Slovenia',
  },
  {
    id: 'spain',
    label: 'Spain',
  },
  {
    id: 'sweden',
    label: 'Sweden',
  },
  {
    id: 'united_kingdom',
    label: 'United Kingdom',
  },
];

const languages = [
  {
    id: 'en',
    label: 'English',
  },
  {
    id: 'de',
    label: 'German',
  },
  {
    id: 'fr',
    label: 'French',
  },
  {
    id: 'other',
    label: 'Other',
  },
];

const source = [
  {
    id: 'title',
    label: 'English title',
    type: 'text',
    required: true,
    icon: 'title',
    className: 'col s6',
  },
  {
    id: 'orgTitle',
    label: 'Original title (if applicable)',
    type: 'text',
    icon: 'title',
    className: 'col s6',
  },
  { id: 'author', type: 'text', label: 'First author and/or organisation', icon: 'person', className: 'col s6' },
  { id: 'yearOfPublication', type: 'number', min: 1900, max: 2100, label: 'Year of publication', className: 'col s3' },
  { id: 'language', label: 'Language', type: 'select', value: 'en', options: languages, className: 'col s3' },
  { id: 'url', label: 'Link', type: 'url', icon: 'link', className: 'col s6' },
  {
    id: 'dissemination',
    required: true,
    label: 'Dissemination level',
    type: 'select',
    className: 'col s3',
    options: [
      {
        id: 'public',
        label: 'Public',
      },
      {
        id: 'restricted',
        label: 'Restricted',
      },
      {
        id: 'secret',
        label: 'Secret',
      },
    ],
  },
  {
    id: 'otherLanguage',
    label: 'Other language',
    type: 'text',
    show: 'language = other',
    options: languages,
    className: 'col s3',
  },
] as Form;

const info = [
  {
    type: 'md',
    value: `### DRIVER+ Lessons Learned Framework

This questionnaire allows you to capture the lessons that you've learned while running a specific event or trial.

#### Intake

_Fields marked with a <span style='color: red;'>*</span> are mandatory._
`,
  },
  {
    id: 'event',
    label: 'Title of the evaluated event',
    description: '_Short name to indicate the event and its evaluation (max. 70 characters)._',
    type: 'text',
    maxLength: 70,
    required: true,
    className: 'col s8',
  },
  { id: 'id', type: 'text', disabled: true, autogenerate: 'guid', required: true, className: 'col s4' },
  {
    id: 'editors',
    label: 'Editors',
    repeat: 0,
    type: [
      {
        id: 'name',
        label: 'Name',
        type: 'text',
        className: 'col s8',
        iconName: 'title',
        required: true,
        description: '_Name of the editor or analist._',
      },
      { id: 'organisation', type: 'text', className: 'col s4' },
      { id: 'country', type: 'select', options: countries, className: 'col s6' },
      { id: 'lastEdit', label: 'Last edit on', type: 'date', className: 'col s6' },
    ],
  },
  { id: 'location', type: 'map', className: 'col s12' },
  {
    id: 'info',
    label: 'Additional info',
    type: 'textarea',
    maxLength: 500,
    description: `_Free space for additional notes by the evaluators (max. 4 lines / 400 characters)._`,
  },
  { id: 'created', label: 'Created "{{event}}" event on:', type: 'date', required: true },
  { id: 'edited', type: 'date', required: true },
  { type: 'md', value: '#### Sources of information' },
  {
    id: 'sources',
    label: 'Publications',
    repeat: 0,
    type: source,
  },
  { id: 'multimedia', label: 'Multimedia sources', repeat: 0, type: [
    { id: 'desc', label: 'Short description', type: 'textarea' },
    { id: 'owner', label: 'Owner', type: 'text', className: 'col s6' },
    { id: 'url', label: 'Link', type: 'url', icon: 'link', className: 'col s6' },
  ]},
  { type: 'md', value: '#### General description of the event' },
  { id: 'eventType', type: 'select', placeholder: 'Pick an option', options: [
    { id: 'risk', label: 'Risk analysis' },
    { id: 'action', label: 'Preventive action' },
    { id: 'incident' },
    { id: 'disaster' },
    { id: 'training' },
    { id: 'excercise' },
    { id: 'test' },
  ] },

] as Form;

export const LLFView = () => {
  const state = {
    result: {} as ILessonLearned,
    isValid: false,
    form: [] as Form,
    error: '',
  };

  const print = (isValid: boolean) => {
    state.isValid = isValid;
    console.log(`Form is valid: ${isValid}`);
    console.log(JSON.stringify(state.result, null, 2));
  };

  state.form = info;

  state.result = {} as ILessonLearned;

  return {
    view: () => {
      const { result, form } = state;

      return m('.row', [
        m('.col.s6.l4', [
          m(SlimdownView, {
            md: `### JSON FORM

          Feel free to edit me.`,
          }),
          m(TextArea, {
            label: 'JSON form',
            initialValue: JSON.stringify(form, null, 2),
            onchange: (value: string) => (state.form = JSON.parse(value)),
          }),
          state.error ? m('p', m('em.red', state.error)) : undefined,
        ]),
        m('.col.s6.l4', [
          m('h3', 'Generated Form'),
          m('div', m(LayoutForm, { form, obj: result, onchange: print, context })),
        ]),
      ]);
    },
  };
};
