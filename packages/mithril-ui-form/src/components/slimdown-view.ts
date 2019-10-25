import m, { FactoryComponent, Attributes } from 'mithril';
import { Slimdown } from 'slimdown-js';

export interface IMarkdownView extends Attributes {
  md?: string;
}

export const SlimdownView: FactoryComponent<IMarkdownView> = () => {
  return {
    view: ({ attrs: { md, className = '.col.s12' } }) =>
      md ? m(`.markdown ${className}`, m.trust(Slimdown.render(md))) : undefined,
  };
};
