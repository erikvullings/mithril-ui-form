import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import sourceMaps from 'rollup-plugin-sourcemaps';
import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';

const pkg = require('./package.json');
const production = !process.env.ROLLUP_WATCH;

export default {
  input: `src/index.ts`,
  output: [
    {
      name: 'uiform',
      file: pkg.main,
      format: 'iife',
      sourcemap: true,
      globals: {
        mithril: 'm',
        'materialize-css': 'M',
        'mithril-materialized': 'm',
        'mithril-leaflet': 'm',
        'leaflet': 'L',
        'leaflet-draw': 'L',
      }
    },
    {
      file: pkg.module,
      format: 'es',
      sourcemap: true,
    },
  ],
  external: ['mithril', 'mithril-materialized', 'materialize-css', 'mithril-leaflet', 'leaflet', 'leaflet-draw'],
  plugins: [
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolve({
      customResolveOptions: {
        moduleDirectory: 'node_modules',
      },
    }),
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs(),
    // Compile TypeScript files
    typescript({
      rollupCommonJSResolveHack: true,
      // objectHashIgnoreUnknownHack: true,
      // tsconfigOverride: { compilerOptions: { module: 'ES2015' } },
      typescript: require('typescript'),
    }),
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    // commonjs(),
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    // resolve({
    //   customResolveOptions: {
    //     moduleDirectory: 'node_modules',
    //   },
    // }),
    // Resolve source maps to the original source
    sourceMaps(),
    // minifies generated bundles
    production && terser({ sourcemap: true }),
  ],
};
