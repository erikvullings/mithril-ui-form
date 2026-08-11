import { FieldRenderer } from './types';
import { colourEditable } from './colour';
import { timeReadonly, timeEditable } from './time';
import { dateReadonly, dateEditable } from './date';
import { datetimeReadonly, datetimeEditable } from './datetime';
import { emailEditable } from './email';
import { numberEditable } from './number';
import { radioReadonly, radioEditable } from './radio';
import { checkboxReadonly, checkboxEditable } from './checkbox';
import { switchReadonly, switchEditable } from './switch';
import { likertReadonly, likertEditable } from './likert';
import { ratingEditable } from './rating';
import { optionsReadonly, optionsEditable } from './options';
import { selectReadonly, selectEditable } from './select';
import { markdownEditable } from './markdown';
import { sectionEditable } from './section';
import { tagsReadonly, tagsEditable } from './tags';
import { autocompleteEditable } from './autocomplete';
import { textareaEditable } from './textarea';
import { fileReadonly, fileEditable } from './file';
import { base64Readonly, base64Editable } from './base64';
import { urlEditable } from './url';
import { textEditable } from './text';

export { defaultReadonly } from './default-readonly';
export * from './types';

/**
 * Built-in field type dispatch, keyed by `field.type`. This is the same shape as the
 * `plugins`/`readonlyPlugins` registries `registerPlugin` builds for custom types - built-in
 * types are just pre-registered instead of user-registered. `FormFieldFactory` looks a type
 * up here (after checking the plugin registries) instead of running a ~850-line switch.
 *
 * Aliases (e.g. 'color'/'colour', 'md'/'markdown') point at the same renderer, matching the
 * grouped `case 'a': case 'b':` clauses they replace - not independent copies.
 */
export const editableFieldRenderers: Record<string, FieldRenderer<any>> = {
  colour: colourEditable,
  color: colourEditable,
  time: timeEditable,
  date: dateEditable,
  datetime: datetimeEditable,
  email: emailEditable,
  number: numberEditable,
  radio: radioEditable,
  checkbox: checkboxEditable,
  likert: likertEditable,
  rating: ratingEditable,
  options: optionsEditable,
  select: selectEditable,
  markdown: markdownEditable,
  md: markdownEditable,
  section: sectionEditable,
  switch: switchEditable,
  tags: tagsEditable,
  autocomplete: autocompleteEditable,
  textarea: textareaEditable,
  file: fileEditable,
  base64: base64Editable,
  url: urlEditable,
  text: textEditable,
};

/**
 * Readonly-mode renderers. A type not listed here (e.g. 'text', 'email', 'colour', which
 * never had a bespoke readonly case) falls back to `defaultReadonly`, matching the original
 * switch's `default:` case. 'md'/'markdown' are deliberately absent: the outer `readonly`
 * guard in FormFieldFactory already excludes them from ever reaching this lookup.
 */
export const readonlyFieldRenderers: Record<string, FieldRenderer<any>> = {
  time: timeReadonly,
  date: dateReadonly,
  datetime: datetimeReadonly,
  switch: switchReadonly,
  checkbox: checkboxReadonly,
  tags: tagsReadonly,
  options: optionsReadonly,
  select: selectReadonly,
  radio: radioReadonly,
  likert: likertReadonly,
  base64: base64Readonly,
  file: fileReadonly,
};
