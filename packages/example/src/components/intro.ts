import m from 'mithril';
import { SlimdownView } from 'mithril-ui-form';
import { dashboardSvc } from '../services/dashboard-service';

export const Intro = () => {
  return {
    view: () => {
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

Give it a go at the [playground](#!/playground).

## Use cases

While creating this, I had the following use cases in mind:

1. I'm currently working on a [scenario editor](https://github.com/DRIVER-EU/scenario-manager), which requires me to define a GUI for each message that can be send. Preferably, I would like to use a JSON form that will generate the GUI for me, so I can quickly add new message types.
2. I'm also working on a [Lessons' Learned Framework](https://github.com/DRIVER-EU) (LLF, a GUI with lesson's learned stored in a database). Since different organisations will have different kinds of lessons, it is easier if I make the LLF agnostic for the specific kind of form.
3. A slight adaptation of the previous is an online questionnaire: Although there are many open or paid alternatives, like SurveyMonkey or Google Forms, they require you to host your service online. However, when security is important, this may not be an option, so it is better to host it locally on your Intranet or within your VPN.
4. Yet another project involves a [specification editor](https://github.com/TNOCS/spec-tool): The end user specifies the form, and a specification object is generated. This generated object is processed and rendered to a document. Features I still need to implement are presets, support for a map, and output generation.
`;

      return m('.row', [
        m('.col.s12.m7.l8', m(SlimdownView, { md })),
        m('.col.s12.m5.l4', [
          m('h1', 'Contents'),
          m('ul.collection', [
            dashboardSvc
              .getList()
              .filter(d => d.visible && !d.default)
              .map(d => m('li.collection-item', m('a', { href: d.route, oncreate: m.route.link }, d.title))),
          ]),
        ]),
      ]);
    },
  };
};
