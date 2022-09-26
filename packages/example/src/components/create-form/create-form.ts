import m, { FactoryComponent } from 'mithril';
import { ILayoutForm, LayoutForm, UIForm } from 'mithril-ui-form';

const componentTypeOptions = [
  { id: 'autogenerate', label: 'autogenerate' },
  { id: 'checkbox', label: 'checkbox' },
  { id: 'color', label: 'color' },
  { id: 'colour', label: 'colour' },
  { id: 'date', label: 'date' },
  { id: 'date', label: 'date' },
  { id: 'email', label: 'email' },
  { id: 'map', label: 'map' },
  { id: 'md', label: 'md' },
  { id: 'none', label: 'none' },
  { id: 'number', label: 'number' },
  { id: 'options', label: 'options' },
  { id: 'radio', label: 'radio' },
  { id: 'select', label: 'select' },
  { id: 'switch', label: 'switch' },
  { id: 'tags', label: 'tags' },
  { id: 'text', label: 'text' },
  { id: 'textarea', label: 'textarea' },
  { id: 'time', label: 'time' },
  { id: 'url', label: 'url' },
];

export const CreateForm: FactoryComponent = () => {
  type EditorField = {
    id: string;
    type: string;
    autogenerate?: 'guid' | 'id';
    className: string;
    disabled: boolean;
  };

  type EditorFields = {
    properties: EditorField[];
  };

  const state = {
    isValid: false,
    editor: [
      {
        id: 'properties',
        label: 'Properties',
        repeat: true,
        type: [
          { id: 'id', type: 'text' },
          { id: 'type', type: 'select', options: componentTypeOptions, className: 'col s8' },
          {
            id: 'autogenerate',
            label: 'Auto-generated',
            show: ['type = autogenerate', 'type = text'],
            type: 'select',
            className: 'col s4',
            options: [
              { id: undefined, label: 'None' },
              { id: 'guid', label: 'GUID' },
              { id: 'id', label: 'ID' },
            ],
          },
          {
            id: 'className',
            label: 'CSS class',
            description: `Determines the width of a field on different (s=small, m, l and xl) display sizes.
            See [materialize-css](https://materializecss.com/grid.html) for the options.`,
            type: 'text',
            className: 'col s8',
            value: 'col s12',
          },
          {
            id: 'disabled',
            type: 'switch',
            className: 'col s4',
          },
        ],
      },
    ] as UIForm<EditorFields>,
    form: [],
    result: {},
    context: {},
  } as {
    isValid: boolean;
    /** Layout form for creating the editor */
    editor: UIForm<EditorFields>;
    /** Generated form for creating another layout from */
    form: UIForm<any>;
    result: Record<string, any>;
    context: Record<string, any>;
  };

  const onchange = (isValid: boolean) => {
    state.isValid = isValid;
    console.log(`Form is valid: ${isValid}`);
    console.log(JSON.stringify(state.form, null, 2));
  };

  return {
    view: () => {
      const { editor, form, result, context } = state;

      return m('.row', [
        m('.col.s12.m6', [
          m('h3', 'Editor'),
          m(LayoutForm, { form: editor, obj: form, context: {}, onchange } as ILayoutForm<any>),
        ]),
        m('.col.s12.m6', [
          m('h3', 'New form'),
          m(LayoutForm, { form, obj: result, onchange: print } as ILayoutForm<any>),
        ]),
      ]);
    },
  };
};
