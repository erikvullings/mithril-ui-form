import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['mithril', 'mithril-ui-form-plugin', 'leaflet', 'leaflet-draw', 'mithril-leaflet'],
  outDir: 'lib',
});