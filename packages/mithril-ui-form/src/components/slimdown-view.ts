import m, { FactoryComponent, Attributes } from 'mithril';
import { render } from 'slimdown-js';

export interface IMarkdownView extends Attributes {
  md?: string;
  removeParagraphs?: boolean;
}

export const SlimdownView: FactoryComponent<IMarkdownView> = () => {
  return {
    view: ({ attrs: { md, removeParagraphs = false, className = '.col.s12' } }) =>
      md ? m(`.markdown ${className}`, m.trust(render(md, removeParagraphs))) : undefined,
  };
};
