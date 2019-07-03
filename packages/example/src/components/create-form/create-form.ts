import m, { FactoryComponent } from 'mithril';
import { IObject, LayoutForm } from 'mithril-ui-form';

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
  const state = {
    isValid: false,
    editor: {
      key: { type: 'text' },
      type: { type: 'select', options: componentTypeOptions },
    },
    form: {},
    result: {},
    context: {},
  } as {
    isValid: boolean;
    /** Layout form for creating the editor */
    editor: IObject;
    /** Generated form for creating another layout from */
    form: IObject;
    result: IObject;
    context: IObject;
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
        m('.col.s12.l6', [m('h3', 'Editor'), m(LayoutForm, { form: editor, obj: form, context: {}, onchange })]),
        // m('.col.s12.l6', [m('h3', 'New form'), m(LayoutForm, { form, obj: result, onchange: print, context })]),
      ]);
    },
  };
};
