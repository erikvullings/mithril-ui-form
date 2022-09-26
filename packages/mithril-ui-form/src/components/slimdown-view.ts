import m, { FactoryComponent, Attributes } from 'mithril';
import { render } from 'slimdown-js';

export interface IMarkdownView extends Attributes {
  /** Markdown text */
  md?: string;
  /** If true, remove the outer <p></p> tags. Default false. */
  removeParagraphs?: boolean;
  /** If true, links open in a new tab. Default false. */
  externalLinks?: boolean;
}

export const SlimdownView: FactoryComponent<IMarkdownView> = () => ({
  view: ({ attrs: { md = '', removeParagraphs = false, externalLinks = false, ...params } }) =>
    m('.slimdown-view.markdown', params, m.trust(render(md, removeParagraphs, externalLinks))),
});
