import { Attributes } from 'mithril';
import { I18n, InputField, Option } from 'mithril-ui-form-plugin';

/**
 * Everything a single field type's renderer needs, computed once per render by
 * `FormFieldFactory` and passed down instead of being recomputed or closed over in a
 * 850-line switch. This is the seam: a field type is a pure `(ctx) => Vnode` function
 * registered under its type name (see `field-types/index.ts`), the same shape the
 * `plugins`/`readonlyPlugins` registries already use for custom types.
 */
export interface FieldRenderContext<O extends Attributes = {}> {
  /** The field's `type` string (already narrowed away from the nested-form-array case). */
  fieldType: string;
  /** Original field definition from the form spec. */
  field: InputField<O>;
  /** The object currently being edited. */
  obj: O;
  /** Resolved field id (field.id ?? ''). */
  id: string;
  /** Current value, already run through `field.transform('from', ...)` if present. */
  iv: unknown;
  /** Presentational props for the underlying mithril-materialized component (label, placeholder, disabled, etc. - see `unwrapComponent`). */
  props: Record<string, any>;
  /** Resolved dropdown/radio/checkbox/tags options (after show-filtering and string->object normalization). */
  options: Option[];
  /** Active i18n bundle for this field. */
  i18n: I18n;
  /** Ancestor objects available for placeholder/expression resolution. */
  context: Array<O | O[keyof O]>;
  /** Commits a new value for this field (handles transform/effect/onFormChange internally). */
  oninput: (v: any) => Promise<void> | void;
  onblur?: any;
  onkeyup?: any;
  onkeydown?: any;
  autofocus?: boolean;
  /** Container id for DatePicker/TimePicker portal rendering. */
  containerId?: string;
  /** Validator derived from `field.required`, or undefined. */
  validate?: (v: string | number | Array<string | number>) => boolean;
  /** Label for the "select all" button on multi-select types, from `field.checkAllOptions`. */
  selectAll: string;
  /** Label for the "unselect all" button on multi-select types, from `field.checkAllOptions`. */
  unselectAll: string;
  /** Mutable per-component-instance state (currently just a redraw-key used by the 'options' type). */
  state: { key: number; stableId?: string };
}

/** A single field type's renderer: given the render context, returns whatever `m()` returns. */
export type FieldRenderer<O extends Attributes = {}> = (ctx: FieldRenderContext<O>) => any;

/** What a field-type module registers: an editable renderer, and optionally a distinct readonly one. */
export interface FieldTypeModule<O extends Attributes = {}> {
  editable?: FieldRenderer<O>;
  readonly?: FieldRenderer<O>;
}
