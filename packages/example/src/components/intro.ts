import m from 'mithril';
import { SlimdownView } from 'mithril-ui-form';
import { dashboardSvc } from '../services/dashboard-service';

export const Intro = () => {
  return {
    view: () => {
      const md = `
# MITHRIL-UI-FORM

This library, together with [Mithril](https://mithriljs.org) and [Mithril-materialized](https://github.com/erikvullings/mithril-materialized), converts a JSON description to a form, allowing you to:

1. Quickly create GUI forms without the normal hassle.
1. Comes with basic validation support (it checks whether all required properties are specified).
1. The form also supports **arrays of objects or strings**.
1. Can optionally **hide** and **disable** elements using the \`show\` property, which can contain one or more expressions. See the editors array.
1. Can contain **placeholders**, e.g. {{ event }}, which will be replaced by the value of \`event\`.
1. Can **generate IDs automatically** (of type \`GUID\` or a shorter version).
1. Upon changes, the result object is updated.

Give it a go at the [playground](#!/playground).`;

      return m('.row', [
        m('.col.s12.m7.l8', m(SlimdownView, { md })),
        m('.col.s12.m5.l4', [
          m('h1', 'Contents'),
          m('ul.collection', [
            dashboardSvc
              .getList()
              .filter((d) => d.visible && !d.default)
              .map((d) => m('li.collection-item', m('a', { href: `#!${d.route}` }, d.title))),
          ]),
        ]),
      ]);
    },
  };
};
