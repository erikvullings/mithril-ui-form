import m, { FactoryComponent, Attributes } from 'mithril';
import { InputField } from 'mithril-ui-form-plugin';
import { SlimdownView } from './slimdown-view';

export interface IReadonlyComponent extends Attributes {
  props: InputField;
  type?: string;
  label?: string;
  initialValue: string | number | Array<string | number>;
  /** If true, put label in front of value. Default false */
  inline?: boolean;
}

export const ReadonlyComponent: FactoryComponent<IReadonlyComponent> = () => {
  return {
    view: ({ attrs: { type, props, label = '', initialValue: iv, inline = false } }) => {
      const cn = { className: props.className || 'col s12' };
      if (iv instanceof Array && iv.length > 3) {
        return m('.readonly', cn, [m('label', label), m(SlimdownView, { md: '\n- ' + iv.join('\n- ') })]);
      } else if (typeof iv === 'string') {
        return type === 'url'
          ? m('.readonly', cn, [m('label', `${label.trim()}: `), m('a[target=_blank]', { href: iv }, iv)])
          : type === 'color'
          ? m('.readonly', cn, [
              m('label', `${label.trim()}: `),
              m('.color', { style: `height: 1rem; width: 40px; border-radius: 4px; background-color: ${iv}` }),
            ])
          : m('.readonly', cn, [m('label', label), m(SlimdownView, { md: iv })]);
      }
      const v = iv instanceof Array ? iv.join(', ') : iv;
      return m('.readonly', cn, [
        label && m('label', label),
        inline ? m('span', v ? `: ${v}` : m.trust('&nbsp;')) : m('p', v || m.trust('&nbsp;')),
      ]);
    },
  };
};
