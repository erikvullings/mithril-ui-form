import m from 'mithril';
import { formFactory, FormType } from 'mithril-ui-form';
import { TextArea } from 'mithril-materialized';

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
  created: Date;
  edited: Date;
  editors: IEditor[];
  sources: ISource[];
  // eventDescription: {
  //   riskCategory: {};
  // };
}

const countries = [{
  id: 'NL',
  label: 'Nederland',
}, {
  id: 'B',
  label: 'België',
}, {
  id: 'D',
  label: 'Duitsland'
}];

const editorType = {
  label: 'Editors',
  type: 'kanban',
  model: {
    id: { label: 'ID', type: 'text' },
    name: { label: 'Name', component: 'text', className: 'col s8', iconName: 'title', required: true },
    role: { label: 'Role', component: 'text', className: 'col s4' },
    country: { label: 'Country', component: 'select', options: countries, className: 'col s6' },
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
// } as FormType<IEditor>;

const source = {
  title: { label: 'Title', type: 'text', maxLength: 80, required: true, icon: 'title' },
  url: { label: 'URL', type: 'url', maxLength: 80, required: true },
} as FormType<ISource>;

const info = {
  id: { type: 'text', maxLength: 80, required: true, className: 'col m6' },
  event: { type: 'text', maxLength: 80, required: true, className: 'col m6' },
  description: { type: 'textarea', maxLength: 500, required: true, icon: 'note' },
  created: { type: 'date', required: true },
  edited: { type: 'date', required: true },
  editors: editorType,
  sources: {
    type: {
      title: { type: 'text', maxLength: 80, required: true, icon: 'title' },
      url: { type: 'url', maxLength: 80, required: true },
    },
  },
  // editors: { type: 'kanban', model: editor },
} as FormType<ILessonLearned>;

export const FormView = () => {
  const state = {
    result: {} as ILessonLearned,
    schema: '',
    error: '',
  };

  // const rs = ResultsService();
  // rs.on('update', (r: unknown) => console.log(JSON.stringify(r, null, 2)));

  const print = () => console.log(JSON.stringify(state.result, null, 2));

  return {
    view: () => {
      const { result } = state;
      const ui = formFactory(info, result, print);
      return m('.row', [
        m('.col.s6', [
          m('h3', 'Schema'),
          m(TextArea, {
            label: 'JSON form',
            onchange: (value: string) => (state.schema = value),
          }),
          state.error ? m('p', m('em.red', state.error)) : undefined,
        ]),
        m('.col.s6', [
          m('h3', 'Generated Form'),
          m('div', ui),
          // uiElement instanceof Array
          //   ? uiElement.map(element => m(UiForm, { element, rs }))
          //   : m(UiForm, { element: uiElement, rs }),
        ]),
      ]);
    },
  };
};
