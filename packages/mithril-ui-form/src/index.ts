// Core types and interfaces from plugin package (with enhanced documentation)
export {
  UIForm,
  I18n,
  InputField,
  FormAttributes,
  PluginType,
  ComponentType,
  UIFormField,
} from 'mithril-ui-form-plugin';

// Main form components and utilities
export {
  FormComponent,
  IFormField,
  SlimdownAttrs,
  IReadonlyComponent,
  IRepeatList,
  IArrayLayoutForm,
  FormFieldFactory,
  LayoutForm,
  ArrayLayoutForm,
  ReadonlyComponent,
  RepeatList,
  SlimdownView,
  registerPlugin,
} from './components';

// Markdown rendering functions from slimdown-js (re-exported with documentation)
export { render, addRule, RegexReplacer } from 'slimdown-js';
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
  flatten,
  formatExpression,
  arrayUtils,
} from './utils';
