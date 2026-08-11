// Core types and interfaces from plugin package (with enhanced documentation)
export type {
  UIForm,
  I18n,
  InputField,
  FormAttributes,
  PluginType,
  ComponentType,
  UIFormField,
} from 'mithril-ui-form-plugin';

// Main form components and utilities
export type {
  FormComponent,
  IFormField,
  SlimdownAttrs,
  IReadonlyComponent,
  IRepeatList,
  IArrayLayoutForm,
} from './components';
export {
  FormFieldFactory,
  LayoutForm,
  ArrayLayoutForm,
  ReadonlyComponent,
  RepeatList,
  SlimdownView,
  registerPlugin,
} from './components';

// Markdown rendering functions from slimdown-js (re-exported with documentation)
export { type RegexReplacer, render, addRule } from 'slimdown-js';
export {
  isComponentType,
  capitalizeFirstLetter,
  range,
  labelResolver,
  deepCopy,
  padLeft,
  stripSpaces,
  toHourMin,
  resolveExpression,
  resolvePlaceholders,
  getPath,
  getPathFuzzy,
  flatten,
  formatExpression,
  arrayUtils,
  dragDropUtils,
} from './utils';
