# A WYSIWYG markdown editor plugin for Mithril-ui-form

[Mithril-ui-form](https://www.npmjs.com/package/mithril-ui-form) is a declarative framework to create forms using the front-end [Mithril framework](https://mithril.js.org/) and [mithril-materialized](https://www.npmjs.com/package/mithril-materialized) components using the [materialize-css](http://materializecss.com/) design theme.

The built-in `md`/`markdown` field type only ever renders static HTML (via `slimdown-js`) - there is no built-in editing UI. This plugin wires [mithril-markdown-wysiwyg](https://github.com/erikvullings/mithril-markdown-wysiwyg) in as a real editor for `md` fields, and pairs it with a sanitized readonly display so readonly forms still show a plain HTML view instead of the editor.

```ts
import { registerPlugin } from 'mithril-ui-form';
import { markdownEditorPlugin, markdownReadonlyPlugin } from 'mithril-ui-form-markdown-plugin';

registerPlugin('md', markdownEditorPlugin, markdownReadonlyPlugin);
```

Registering only the editor (`registerPlugin('md', markdownEditorPlugin)`) still works, but readonly `md` fields will then always render through the editable plugin too (with `onchange` present) - pass `markdownReadonlyPlugin` as well if you want a genuinely non-interactive display for readonly forms.

## Field options

Any of `mithril-markdown-wysiwyg`'s `MarkdownEditorAttrs` (other than `content`/`onContentChange`, which mithril-ui-form wires up for you) can be set directly on the field definition:

```ts
const form: UIForm<{ notes: string }> = [
  {
    id: 'notes',
    type: 'md',
    label: 'Notes',
    theme: 'dark',
    toolbar: true,
    showTabs: true,
    isPreview: false,
  },
];
```

See [`MarkdownPluginOptions`](./src/plugin.ts) for the full list.

## Sanitization

Both the editor and the readonly plugin sanitize their rendered HTML with [DOMPurify](https://github.com/cure53/DOMPurify) before it reaches the DOM, since `slimdown-js` does not sanitize raw HTML embedded in markdown source and `md` fields can be bound to real, potentially user-authored data (`obj[id]`), not just static form-spec content.

## Styling

`mithril-markdown-wysiwyg` ships its own CSS. If your bundler doesn't already resolve the package's CSS import automatically, import it explicitly once in your app:

```ts
import 'mithril-markdown-wysiwyg/style.css';
```
