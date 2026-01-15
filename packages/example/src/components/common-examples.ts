import m from 'mithril';
import { FormAttributes, LayoutForm, UIForm } from 'mithril-ui-form';

const examples = [
  {
    title: 'Text Input',
    json: [
      {
        id: 'name',
        label: 'Name',
        type: 'text',
        required: true,
        maxLength: 50,
        placeholder: 'Enter your full name',
      },
    ] as UIForm<{ name: string }>,
    obj: {},
  },
  {
    title: 'Text Area',
    json: [
      {
        id: 'description',
        label: 'Description',
        type: 'textarea',
        maxLength: 500,
        placeholder: 'Enter a description',
      },
    ] as UIForm<{ description: string }>,
    obj: {},
  },
  {
    title: 'Number Input',
    json: [
      {
        id: 'age',
        label: 'Age',
        type: 'number',
        min: 0,
        max: 120,
        required: true,
      },
    ] as UIForm<{ age: number }>,
    obj: {},
  },
  {
    title: 'Date and Time',
    json: [
      {
        id: 'event_date',
        label: 'Event Date',
        type: 'datetime',
        required: true,
      },
    ] as UIForm<{ event_date: Date }>,
    obj: {},
  },
  {
    title: 'Color Picker',
    json: [
      {
        id: 'theme_color',
        label: 'Theme Color',
        type: 'color',
      },
    ] as UIForm<{ theme_color: string }>,
    obj: {},
  },
  {
    title: 'Select Dropdown',
    json: [
      {
        id: 'country',
        label: 'Country',
        type: 'select',
        options: [
          { id: 'us', label: 'United States' },
          { id: 'ca', label: 'Canada' },
          { id: 'mx', label: 'Mexico' },
        ],
      },
    ] as UIForm<{ country: string }>,
    obj: {},
  },
  {
    title: 'Radio Buttons',
    json: [
      {
        id: 'gender',
        label: 'Gender',
        type: 'radio',
        options: [
          { id: 'male', label: 'Male' },
          { id: 'female', label: 'Female' },
          { id: 'other', label: 'Other' },
        ],
      },
    ] as UIForm<{ gender: string }>,
    obj: {},
  },
  {
    title: 'Likert Scale',
    json: [
      {
        min: 1,
        max: 5,
        id: 'happiness',
        label: 'How happy are you?',
        type: 'likert',
        startLabel: 'depressed',
        middleLabel: 'OK',
        endLabel: 'very happy',
      },
      {
        min: 1,
        max: 5,
        id: 'depression',
        label: 'How often are you feeling down?',
        type: 'likert',
        startLabel: 'monthly',
        middleLabel: 'weekly',
        endLabel: 'daily',
        show: 'happiness <= 2',
      },
      {
        min: 1,
        max: 5,
        id: 'agressiveness',
        label: 'How often are you aggressive?',
        type: 'likert',
        startLabel: 'never',
        middleLabel: 'sometimes',
        endLabel: 'daily',
      },
    ] as UIForm<{ happiness: number; depression: number; agressiveness: number }>,
    obj: {},
  },
  {
    title: 'Rating (default)',
    json: [
      {
        id: 'satisfaction',
        label: 'Satisfaction',
        type: 'rating',
        min: 1,
        max: 7,
        value: 5,
        disabled: true,
      },
    ] as UIForm<{ satisfaction: number }>,
    obj: {},
  },
  {
    title: 'Rating (custom plugin)',
    json: [
      {
        id: 'satisfaction',
        label: 'Satisfaction',
        type: 'custom-rating',
        min: 1,
        max: 5,
      },
    ] as UIForm<{ satisfaction: string }>,
    obj: {},
  },
  {
    title: 'Checkboxes',
    json: [
      {
        id: 'interests',
        label: 'Interests',
        type: 'checkbox',
        options: [
          { id: 'sports', label: 'Sports' },
          { id: 'music', label: 'Music' },
          { id: 'movies', label: 'Movies' },
        ],
      },
    ] as UIForm<{ interests: string }>,
    obj: {},
  },
  {
    title: 'Switch',
    json: [
      {
        id: 'notifications',
        label: 'Enable Notifications',
        type: 'switch',
      },
    ] as UIForm<{ notifications: string }>,
    obj: {},
  },
  {
    title: 'File Upload',
    json: [
      {
        id: 'avatar',
        label: 'Avatar',
        type: 'file',
        url: '/upload',
        options: [{ id: 'image/*' }],
      },
    ] as UIForm<{ avatar: string }>,
    obj: {},
  },
  {
    title: 'Tags Input',
    json: [
      {
        id: 'tags',
        label: 'Tags',
        type: 'tags',
      },
    ] as UIForm<{ tags: string[] }>,
    obj: {},
  },
  {
    title: 'Autocomplete',
    json: [
      {
        id: 'framework',
        label: 'JS Framework',
        type: 'autocomplete',
        options: [
          { id: 'react', label: 'React' },
          { id: 'vue', label: 'Vue' },
          { id: 'angular', label: 'Angular' },
        ],
      },
    ] as UIForm<{ framework: string }>,
    obj: {},
  },
  {
    title: 'Repeating Sections',
    json: [
      {
        id: 'editors',
        label: 'Editors',
        repeat: true,
        type: [
          { id: 'name', label: 'Name', type: 'text' },
          { id: 'role', label: 'Role', type: 'text' },
        ],
      },
    ] as UIForm<{ editors: Array<{ name: string; role: string }> }>,
    obj: {
      editors: [{ name: 'John Doe', role: 'Developer' }],
    },
  },
  {
    title: 'Conditional Visibility',
    json: [
      {
        id: 'is_company',
        label: 'Are you a company?',
        type: 'switch',
      },
      {
        id: 'company_name',
        label: 'Company Name',
        type: 'text',
        show: 'is_company',
      },
    ] as UIForm<{ is_company: boolean; company_name: string }>,
    obj: {},
  },
];

export const CommonExamples = {
  view: () => {
    return m('.row', [
      m('.col.s12', m('h2', 'Common Form Field Examples')),
      ...examples.map((example) =>
        m('.col.s12', [
          m('.card', [
            m(
              '.card-content',
              m('.row', [
                m('h4.card-title.col.s12', example.title),
                m(LayoutForm, {
                  form: example.json,
                  obj: example.obj,
                  onchange: () => {},
                } as FormAttributes<any>),
                m('pre.col.s12', m('code', JSON.stringify(example.json, null, 2))),
              ])
            ),
          ]),
        ])
      ),
    ]);
  },
};
