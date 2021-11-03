import m, { FactoryComponent, Attributes } from 'mithril';
import { render } from '../utils/slimdown-js';

export interface IMarkdownView extends Attributes {
  md?: string;
  removeParagraphs?: boolean;
}

export const SlimdownView: FactoryComponent<IMarkdownView> = () => {
  return {
    view: ({ attrs: { md, removeParagraphs = false, className = '' } }) =>
      md ? m(`.markdown ${className}`, m.trust(render(md, removeParagraphs))) : undefined,
  };
};
