import m from 'mithril';
import { LayoutForm, UIForm, SlimdownView, I18n, render, FormAttributes } from 'mithril-ui-form';
import { TextArea } from 'mithril-materialized';
import { ILessonLearned, llf } from '../utils/examples';
export interface IContext {
  admin: boolean;
}

export const FormView = () => {
  const state = {
    result: {} as ILessonLearned,
    isValid: false,
    form: [] as UIForm<any>,
    error: '',
  };

  const print = (isValid: boolean) => {
    state.isValid = isValid;
    console.log(`Form is ${isValid ? '' : 'in'}valid.`);
    console.log(JSON.stringify(state.result, null, 2));
  };

  state.form = llf;

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
      {
        name: 'John Doe',
        role: 'Unknown guy, a.k.a. The Dude',
        region: 'eu',
        country: 'BE',
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
              i18n: {
                deleteItem: 'Verwijder het item',
                agree: 'Ja',
                disagree: 'Nee',
                locales: ['nl-NL'],
                dateTimeOptions: { day: '2-digit', month: 'long', weekday: 'long', second: undefined },
              } as I18n,
            } as FormAttributes<ILessonLearned>)
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
