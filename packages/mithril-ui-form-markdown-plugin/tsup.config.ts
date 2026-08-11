import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: false,
  sourcemap: true,
  clean: true,
  external: ['mithril', 'mithril-ui-form-plugin', 'mithril-markdown-wysiwyg', 'dompurify'],
  outDir: 'lib',
});
