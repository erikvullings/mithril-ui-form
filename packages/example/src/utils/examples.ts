import { InputField, UIForm } from 'mithril-ui-form';

/** Relevant context for the Form, can be used with show/disabling */
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

export interface ILessonLearned {
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
  repeat: true,
  type: [
    { id: 'id', autogenerate: 'id' },
    { id: 'name', label: 'Name', type: 'text', className: 'col s8', iconName: 'title', required: true },
    { id: 'role', label: 'Role', type: 'text', className: 'col s4' },
    { id: 'region', label: 'Region', type: 'select', options: regions, className: 'col s6' },
    { id: 'country', label: 'Country', type: 'select', options: countries, className: 'col s6', disabled: '!region' },
  ],
} as InputField<ILessonLearned, 'editors'>;

const source = [
  { id: 'title', label: 'Title', type: 'text', maxLength: 80, required: true, icon: 'title', className: 'col s4' },
  { id: 'url', label: 'URL', type: 'url', maxLength: 80, required: true, icon: 'link', className: 'col s8' },
] as UIForm<ISource>;

export const geojsonInfo = [
  {
    id: 'geojson',
    label: 'GeoJSON editor',
    description: '_My description_',
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
    ] as UIForm<{ title: string; id: string; description: string }>,
  },
] as UIForm<any>;

export const tartan = [
  {
    id: 'vignettes',
    label: 'New vignette',
    repeat: true,
    pageSize: 1,
    // "propertyFilter": "title",
    // "filterLabel": "Filter by title",
    type: [
      {
        id: 'id',
        label: 'Number of the round',
        type: 'number',
        steps: 0,
        className: 'col s4',
      },
      {
        id: 'title',
        label: 'Title',
        type: 'text',
        className: 'col s8',
      },
      {
        id: 'selectedCards',
        label: 'Selected cards',
        type: 'options',
        multipe: true,
        options: [
          {
            id: 'id318c83bd',
            label: 'JSM FOR F-35',
          },
        ],
        className: 'col s12',
        checkboxClass: 'col s6',
      },
      {
        id: 'pages',
        repeat: true,
        min: 1,
        max: 5,
        label: 'Add page',
        pageSize: 1,
        type: [
          {
            id: 'title',
            label: 'Title of the page',
            type: 'text',
            className: 'col s8',
          },
          {
            id: 'image',
            label: 'Image',
            type: 'base64',
            className: 'col s4',
            options: [{ id: 'image/*' }],
          },
          {
            id: 'text',
            label: 'Text',
            description: 'You can use [Markdown notation](https://www.markdownguide.org/basic-syntax/)',
            type: 'textarea',
          },
        ],
      },
    ],
  },
] as UIForm<any>;

export const llf = [
  // { id: 'datetime', label: 'Date and time', type: 'datetime', value: Date.now() },
  // { id: 'date', label: 'Date', type: 'date', value: Date.now() },
  // { id: 'time', label: 'Time', type: 'time', value: Date.now() },
  // { id: 'datetime', label: 'Date and time', type: 'datetime', value: Date.now(), disabled: true },
  // { id: 'date', label: 'Date', type: 'date', value: Date.now(), disabled: true },
  // { id: 'time', label: 'Time', type: 'time', value: Date.now(), disabled: true },
  {
    type: 'md',
    value: `# Welcome to the playground

Please edit the definition to the left and see the result here.`,
  },
  {
    id: 'hasIndDiff',
    label: 'Has individual differences?',
    type: 'select',
    options: [
      { id: 1, label: 'None' },
      { id: 2, label: 'Unknown' },
      { id: 3, label: 'Yes' },
    ],
    className: 'col s4',
  },
  {
    id: 'image',
    label: 'Image',
    type: 'base64',
    max: 100,
    className: 'col s8',
    options: [{ id: 'image/*' }],
  },
  {
    id: 'diff',
    label: 'Individual differences',
    type: 'textarea',
    className: 'col s8',
    show: 'hasIndDiff = 3',
  },
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
    id: 'my_rating2',
    label: 'Disabled rating',
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
  // { id: 'area', type: 'map', required: true, className: 'col s12' },
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
] as UIForm<any>;
