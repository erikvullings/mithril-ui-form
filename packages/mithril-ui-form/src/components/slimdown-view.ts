import m, { FactoryComponent, Attributes } from 'mithril';
import { Slimdown } from 'slimdown-js';

export interface IMarkdownView extends Attributes {
  md?: string;
}

export const SlimdownView: FactoryComponent<IMarkdownView> = () => {
  return {
    view: ({ attrs: { md } }) => md ? m('.markdown', m.trust(Slimdown.render(md))) : undefined,
  };
};
