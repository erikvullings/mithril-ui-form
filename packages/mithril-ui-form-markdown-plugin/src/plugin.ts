import m from 'mithril';
import { PluginType } from 'mithril-ui-form-plugin';
import { MarkdownEditor, markdownToHtml, type EditorMode, type ThemeMode, type I18nStrings } from 'mithril-markdown-wysiwyg';
import DOMPurify from 'dompurify';

/**
 * Extra `field` properties this plugin understands, on top of the base `InputField`
 * properties (`label`, `placeholder`, `disabled`, etc., already forwarded via `props`).
 * All are optional and map directly onto `mithril-markdown-wysiwyg`'s `MarkdownEditorAttrs`.
 */
export interface MarkdownPluginOptions {
  /** Initial editor mode. Defaults to 'wysiwyg'. */
  mode?: EditorMode;
  /** Editor color theme. Defaults to 'light'. */
  theme?: ThemeMode;
  /** Whether to show the formatting toolbar. Defaults to true. */
  toolbar?: boolean;
  /** Whether to show the wysiwyg/markdown mode-switching tabs. Defaults to true. */
  showTabs?: boolean;
  /** Whether to show a live preview pane alongside the editor. Defaults to false. */
  isPreview?: boolean;
  /** Partial i18n string overrides for the editor's own UI text. */
  markdownI18n?: Partial<I18nStrings>;
}

/**
 * Editable markdown field: a full WYSIWYG/markdown-source editor
 * (see https://github.com/erikvullings/mithril-markdown-wysiwyg).
 *
 * `onchange` always receives the current content as a markdown string, regardless of
 * which mode (wysiwyg/markdown) the user is editing in - matching `MarkdownEditorAttrs`'s
 * own `onContentChange` contract.
 *
 * Register alongside `markdownReadonlyPlugin` so a readonly field renders the static,
 * sanitized display instead of the editor:
 * ```ts
 * registerPlugin('md', markdownEditorPlugin, markdownReadonlyPlugin);
 * ```
 */
export const markdownEditorPlugin: PluginType<string, MarkdownPluginOptions> = () => ({
  view: ({ attrs: { iv, field, props, onchange } }) =>
    m(MarkdownEditor, {
      content: (iv as string) || '',
      placeholder: props.placeholder,
      mode: field.mode,
      theme: field.theme,
      toolbar: field.toolbar,
      showTabs: field.showTabs,
      isPreview: field.isPreview,
      i18n: field.markdownI18n,
      onContentChange: (md: string) => onchange?.(md),
    }),
});

/**
 * Readonly markdown field: renders sanitized static HTML via the same `slimdown-js` renderer
 * `mithril-markdown-wysiwyg` uses internally (`markdownToHtml`), matching
 * `mithril-ui-form`'s own `SlimdownView` behavior (sanitize-by-default via DOMPurify, since
 * this content can be bound to real, potentially user-authored data via `obj[id]`).
 */
export const markdownReadonlyPlugin: PluginType<string, MarkdownPluginOptions> = () => ({
  view: ({ attrs: { iv, props } }) =>
    m(
      '.slimdown-view.markdown',
      { className: props.className },
      m.trust(DOMPurify.sanitize(markdownToHtml((iv as string) || '')))
    ),
});
