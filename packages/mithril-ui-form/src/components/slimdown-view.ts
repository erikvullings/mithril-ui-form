import m, { FactoryComponent, Attributes } from 'mithril';
import { render } from 'slimdown-js';
import DOMPurify from 'dompurify';

export interface SlimdownAttrs extends Attributes {
  /** Markdown text */
  md?: string;
  /** If true, remove the outer <p></p> tags. Default false. */
  removeParagraphs?: boolean;
  /** If true, links open in a new tab. Default false. */
  externalLinks?: boolean;
  /**
   * If true, skip HTML sanitization and trust the rendered markdown as-is. Default false.
   *
   * `slimdown-js` does not sanitize raw HTML embedded in its input (only code/math blocks
   * are escaped), so by default this component runs the rendered HTML through DOMPurify
   * before handing it to `m.trust`. Only set this to `true` for `md` content you know is
   * author-controlled (e.g. static copy from the form definition itself) and never derived
   * from end-user input - `md` fields bound to `obj[id]` (see `field-types/markdown.ts`)
   * can hold arbitrary user-authored text and must stay sanitized.
   */
  trustHtml?: boolean;
}

/**
 * Uses the `render` function from `slimdown-js` to convert markdown to HTML, sanitizing the
 * result with DOMPurify before injecting it into the DOM (see `trustHtml` to opt out).
 * @returns Mithril component for rendering markdown
 */
export const SlimdownView: FactoryComponent<SlimdownAttrs> = () => ({
  view: ({ attrs: { md = '', removeParagraphs = false, externalLinks = false, trustHtml = false, ...params } }) => {
    const html = render(md, removeParagraphs, externalLinks);
    return m('.slimdown-view.markdown', params, m.trust(trustHtml ? html : DOMPurify.sanitize(html)));
  },
});
