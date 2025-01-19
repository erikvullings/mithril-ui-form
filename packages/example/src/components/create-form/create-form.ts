import m, { FactoryComponent } from 'mithril';
import { FlatButton, Tabs } from 'mithril-materialized';
import { FormAttributes, LayoutForm, UIForm } from 'mithril-ui-form';
import { llf, tartan } from '../../utils/examples';
import { ratingPlugin } from 'mithril-ui-form-rating-plugin';
import { registerPlugin } from 'mithril-ui-form';

registerPlugin('rating', ratingPlugin);

type UILabel = {
  id: string;
  repeat?: boolean;
  type?: string | UIForm<UILabel> | any;
  label?: string;
  index?: number;
  min?: number;
  max?: number;
  placeholder?: string;
  description?: string;
  className?: string;
  multiple?: boolean;
  checkboxClass?: string;
  show?: string;
  required?: boolean;
  options?: Array<{ id: string; label: string }>;
};

export const labelGeneratorForm = [
  {
    id: 'repeat',
    label: 'Is group',
    type: 'switch',
    className: 'col s3',
  },
  {
    id: 'id',
    label: 'Property',
    required: true,
    placeholder: 'Property name',
    type: 'text',
    className: 'col s3',
  },
  { id: 'label', label: 'Property label', type: 'text', className: 'col s6' },
  {
    id: 'required',
    label: 'Required',
    type: 'switch',
    value: 'true',
    left: 'No',
    right: 'Yes',
    className: 'col s3',
  },
  {
    id: 'type',
    label: 'Property type',
    type: 'select',
    required: true,
    value: 'text',
    show: ['!repeat', 'repeat=false'],
    className: 'col s3',
    options: [
      { id: 'text', label: 'Text' },
      { id: 'textarea', label: 'Text area' },
      { id: 'number', label: 'Number' },
      { id: 'url', label: 'Link / URL' },
      { id: 'email', label: 'E-mail' },
      { id: 'checkbox', label: 'Checkbox' },
      { id: 'radio', label: 'Radio button' },
      { id: 'select', label: 'Dropdown' },
      { id: 'options', label: 'Checkbox' },
      { id: 'none', label: 'Hidden' },
      { id: 'md', label: 'Markdown' },
      { id: 'rating', label: 'Rating' },
    ],
  },
  {
    id: 'min',
    label: 'Min',
    placeholder: 'Min value/length',
    type: 'number',
    className: 'col s3',
  },
  {
    id: 'max',
    label: 'Max',
    placeholder: 'Max value/length',
    type: 'number',
    className: 'col s3',
  },
  {
    id: 'multiple',
    label: 'Multiple',
    type: 'switch',
    className: 'col s3',
    show: ['type=select', 'type=options'],
  },
  {
    id: 'checkboxClass',
    label: 'Option layout',
    type: 'text',
    className: 'col s4',
    placeholder: 'col s4',
    show: ['type=radio', 'type=options'],
  },
  { id: 'value', label: 'Intial value', type: 'textarea', show: ['type=md'], className: 'col s12' },
  {
    id: 'placeholder',
    label: 'Placeholder',
    type: 'text',
    className: 'col s4',
    show: ['!repeat', 'repeat=false'],
  },
  { id: 'description', label: 'Help text', type: 'text', className: 'col s4', show: ['!repeat', 'repeat=false'] },
  {
    id: 'className',
    label: 'Layout instructions',
    type: 'text',
    placeholder: 'col s12',
    className: 'col s4',
    description: 'See [Materialize-CSS](https://materializecss.com/grid.html).',
    show: ['repeat=false', '!repeat'],
  },
  {
    id: 'show',
    label: 'Show condition',
    type: 'tags',
    placeholder: 'id=value',
    className: 'col s5',
    description: 'key!=value',
  },
  {
    id: 'options',
    label: 'Options',
    className: 'col s12',
    show: ['type=select', 'type=options', 'type=radio', 'type=rating'],
    repeat: true,
    pageSize: 100,
    required: true,
    type: [
      { id: 'id', label: 'Option ID', type: 'text', className: 'col s4' },
      { id: 'label', label: 'Label', type: 'text', className: 'col s8' },
    ],
  },
] as UIForm<UILabel>;

labelGeneratorForm.push({
  id: 'type',
  label: 'Sub-labels',
  show: ['repeat=true'],
  repeat: true,
  pageSize: 1,
  type: labelGeneratorForm as UIForm<any>,
});

export const CreateForm: FactoryComponent = () => {
  const state = {
    isValid: false,
    form: { properties: [] },
    result: {},
    context: {},
  } as {
    isValid: boolean;
    /** Generated form for creating another layout from */
    form: { properties: UIForm<any> };
    result: Record<string, any>;
    context: Record<string, any>;
  };

  const onchange = (isValid: boolean) => {
    state.isValid = isValid;
    console.log(`Form is valid: ${isValid}`);
    console.log(JSON.stringify(state.form, null, 2));
  };

  const ex1: UIForm<any> = [
    {
      repeat: true,
      id: 'facts',
      label: 'Facts',
      min: 1,
      max: 3,
      required: true,
      type: [
        {
          required: true,
          type: 'select',
          id: 'type',
          label: 'Type',
          options: [
            {
              id: 'cocaine',
              label: 'Cocaine',
            },
            {
              id: 'money',
              label: 'Money',
            },
          ],
          className: 'col s4',
        },
        {
          required: true,
          type: 'number',
          id: 'quantity',
          label: 'Quantity',
          className: 'col s4',
        },
        {
          required: true,
          type: 'text',
          id: 'unit',
          label: 'Unit',
          className: 'col s4',
        },
      ],
    },
  ];

  const ex2 = llf;

  const ex3 = tartan;

  const fullLabelGeneratorForm = [
    {
      id: 'properties',
      label: 'Properties',
      repeat: true,
      pageSize: 1,
      type: labelGeneratorForm,
    },
  ] as UIForm<any>;

  return {
    view: () => {
      const { form, result } = state;

      return m(
        '.row',
        {
          style: {
            width: '95%',
            paddingTop: '10px',
          },
        },
        [
          m(
            '.col.s12.m6',
            m(Tabs, {
              tabs: [
                {
                  title: 'Create Form',
                  vnode: m(LayoutForm, {
                    form: fullLabelGeneratorForm,
                    obj: form,
                    onchange,
                  } as FormAttributes<any>),
                },
                {
                  title: 'Examples',
                  vnode: m(
                    '.row.examples',
                    m(FlatButton, {
                      label: 'Lessons learned',
                      iconName: 'looks_one',
                      className: 'button',
                      onclick: () => {
                        state.form = { properties: ex2 };
                      },
                    }),
                    m(FlatButton, {
                      label: 'Facts',
                      iconName: 'looks_two',
                      className: 'button',
                      onclick: () => {
                        state.form = { properties: ex1 };
                      },
                    }),
                    m(FlatButton, {
                      label: 'Vignettes',
                      iconName: 'looks_3',
                      className: 'button',
                      onclick: () => {
                        state.form = { properties: ex3 };
                      },
                    })
                  ),
                },
              ],
            })
          ),

          m(
            '.col.s12.m6',
            m(Tabs, {
              tabs: [
                {
                  title: 'Form',
                  vnode: m(LayoutForm, { form: form.properties, obj: result, onchange } as FormAttributes<any>),
                },
                { title: 'JSON Output', vnode: m('pre', JSON.stringify(result, null, 2)) },
                { title: 'JSON Form', vnode: m('pre', JSON.stringify(form.properties, null, 2)) },
              ],
            })
          ),
        ]
      );
    },
  };
};
