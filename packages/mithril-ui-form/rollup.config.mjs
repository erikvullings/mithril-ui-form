import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import terser from '@rollup/plugin-terser';
import { readFileSync } from 'fs';
import typescript_lib from 'typescript';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));
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
  watch: {
    include: 'src/**',
    clearScreen: false
  },
  external: ['mithril', 'mithril-materialized', 'mithril-leaflet', 'leaflet', 'leaflet-draw'],
  plugins: [
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolve({
      moduleDirectories: ['node_modules'],
    }),
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs(),
    // Compile TypeScript files
    typescript({
      // objectHashIgnoreUnknownHack: true,
      // tsconfigOverride: { compilerOptions: { module: 'ES2015' } },
      typescript: typescript_lib,
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
    // Sourcemaps are generated automatically by TypeScript plugin
    // minifies generated bundles
    production && terser(),
  ],
};
