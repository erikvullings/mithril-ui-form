import m, { FactoryComponent, Attributes } from 'mithril';
import { render } from 'slimdown-js';

export interface SlimdownAttrs extends Attributes {
  /** Markdown text */
  md?: string;
  /** If true, remove the outer <p></p> tags. Default false. */
  removeParagraphs?: boolean;
  /** If true, links open in a new tab. Default false. */
  externalLinks?: boolean;
}

/**
 * Uses the `render` function from `slimdown-js` to convert markdown to HTML
 * @returns Mithril component for rendering markdown
 */
export const SlimdownView: FactoryComponent<SlimdownAttrs> = () => ({
  view: ({ attrs: { md = '', removeParagraphs = false, externalLinks = false, ...params } }) =>
    m('.slimdown-view.markdown', params, m.trust(render(md, removeParagraphs, externalLinks))),
});
