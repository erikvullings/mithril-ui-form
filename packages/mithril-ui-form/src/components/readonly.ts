import m, { FactoryComponent, Attributes } from 'mithril';
import { IObject } from '../models';
import { SlimdownView } from './slimdown-view';

export interface IReadonlyComponent extends Attributes {
  props: IObject;
  label?: string;
  initialValue: string | number | Array<string | number>;
  /** If true, put label in front of value. Default false */
  inline?: boolean;
}

export const ReadonlyComponent: FactoryComponent<IReadonlyComponent> = () => {
  return {
    view: ({ attrs: { props, label, initialValue: iv, inline = false } }) => {
      const cn = { className: props.className || 'col s12' };
      if (iv instanceof Array && iv.length > 3) {
        return m('.readonly', cn, [m('label', label), m(SlimdownView, { md: '\n- ' + iv.join('\n- ') })]);
      } else if (typeof iv === 'string') {
        return m('.readonly', cn, [m('label', label), m(SlimdownView, { md: iv })]);
      }
      const v = iv instanceof Array ? iv.join(', ') : iv;
      return m('.readonly', cn, [
        label && m('label', label),
        inline ? m('span', v ? `: ${v}` : m.trust('&nbsp;')) : m('p', v || m.trust('&nbsp;')),
      ]);
    },
  };
};
