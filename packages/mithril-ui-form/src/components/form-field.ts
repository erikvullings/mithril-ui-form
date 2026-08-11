import m, { Attributes, Component } from 'mithril';
import { PluginType, InputField, I18n, FormAttributes, UIForm, Option } from 'mithril-ui-form-plugin';
import { render } from 'slimdown-js';
import { uuid4, uniqueId } from 'mithril-materialized';
import {
  capitalizeFirstLetter,
  evalExpression,
  canResolvePlaceholders,
  resolvePlaceholders,
  resolveExpression,
} from '../utils';
import { LayoutForm } from './layout-form';
import {
  editableFieldRenderers,
  readonlyFieldRenderers,
  defaultReadonly,
  FieldRenderContext,
  FieldRenderer,
} from './field-types';

// Generate a unique ID with form-level scope to prevent collisions
const generateFormFieldId = (fieldId: string, formContext = 'default'): string => {
  return `mui_${formContext}_${fieldId}_${uniqueId()}`;
};

const unwrapComponent = <O extends Record<string, any> = {}>(
  field: InputField<O>,
  autofocus = false,
  disabled = false,
  formContext = 'default',
  _obj?: O,
  stableId?: string
) => {
  const {
    id = '',
    label,
    description,
    required,
    multiple,
    className,
    checkboxClass,
    icon,
    iconClass,
    placeholder,
    maxLength,
    minLength,
    max,
    min,
    step,
    dateTimeOutput,
    dateTimeSeconds,
    dateFormat,
    twelveHour,
    startLabel,
    middleLabel,
    endLabel,
  } = field;
  const result = {
    id: stableId || generateFormFieldId(String(id), formContext),
    label,
  } as Record<string, any>;
  if (typeof label === 'undefined' && id) {
    result.label = capitalizeFirstLetter(String(id));
  }
  if (description) {
    result.helperText = render(description, true);
  }
  if (startLabel) {
    result.startLabel = render(startLabel, true);
  }
  if (endLabel) {
    result.endLabel = render(endLabel, true);
  }
  if (middleLabel) {
    result.middleLabel = render(middleLabel, true);
  }
  if (className) {
    result.className = className;
  }
  if (icon) {
    result.iconName = icon;
  }
  if (iconClass) {
    result.iconClass = iconClass;
  }
  if (checkboxClass) {
    result.checkboxClass = checkboxClass;
  }
  if (placeholder) {
    result.placeholder = placeholder;
  }
  if (required) {
    result.isMandatory = true;
    result['aria-required'] = 'true';
  }
  if (multiple) {
    result.multiple = multiple;
  }
  if (disabled) {
    result.disabled = true;
    result['aria-disabled'] = 'true';
  }
  if (autofocus) {
    result.autofocus = true;
  }
  if (typeof maxLength !== 'undefined') {
    result.maxLength = maxLength;
  }
  if (typeof minLength !== 'undefined') {
    result.minLength = minLength;
  }
  if (typeof max !== 'undefined') {
    result.max = max;
  }
  if (typeof min !== 'undefined') {
    result.min = min;
  }
  if (typeof step !== 'undefined') {
    result.step = step;
  }
  if (dateTimeOutput) {
    result.dateTimeOutput = dateTimeOutput;
  }
  if (dateTimeSeconds) {
    result.dateTimeSeconds = dateTimeSeconds;
  }
  if (dateFormat) {
    result.dateFormat = dateFormat;
  }
  if (twelveHour) {
    result.twelveHour = twelveHour;
  }

  return result;
};

export interface IFormField<O extends Attributes = {}> extends Attributes {
  /** The input field (or form) that must be rendered repeatedly */
  field: InputField<O>;
  /** The resulting object */
  obj: O;
  context: Array<O | O[keyof O]>;
  autofocus?: boolean;
  /** Callback function, invoked every time the original result object has changed */
  onchange: (result: O) => void;
  /** Disable the form field, disallowing edits */
  disabled?: boolean | string | string[];
  /** Section ID to display - can be used to split up the form and only show a part */
  section?: string;
  /** Optional container ID for DatePicker and TimePicker to render their content in */
  containerId?: string;
  /** Set to true when the view should return only readonly components */
  readonly?: boolean;
  /** Localization options */
  i18n?: I18n;
}

/**
 * Whether a plugin is being invoked from the `readonlyPlugins` registry (must not mutate
 * the value) or the `plugins` registry (may mutate via `onchange`). This is independent of
 * whether the field itself is rendered in the outer `readonly` DOM branch: a `plugins`-registry
 * component invoked as a fallback (no dedicated readonly plugin registered) still gets
 * `onchange`, matching the pre-existing behavior this helper replaces.
 */
type PluginInvocationMode = 'readonly' | 'editable';

/**
 * Builds the props for invoking a registered field plugin, matching the `PluginType`
 * contract in `mithril-ui-form-plugin/src/plugin.ts`: every plugin receives `iv`, `field`,
 * `props`, `label`, `obj`, and `context`; only `'editable'`-mode invocations also receive
 * `onchange`.
 */
const invokePlugin = <O extends Attributes = {}, V = unknown>(
  plugin: PluginType,
  mode: PluginInvocationMode,
  iv: unknown,
  field: InputField<O>,
  props: InputField<O>,
  obj: O,
  context: Array<O | O[keyof O]>,
  onchange: (value: V) => Promise<void> | void
) => {
  const attrs = {
    iv,
    field,
    props,
    label: props.label,
    obj,
    context,
    ...(mode === 'editable' ? { onchange } : {}),
  };
  // `PluginType`'s declared attrs type is `InputField & F` / `InputField` (bare, F/O default
  // to `any`), and `InputField.type` self-references `InputField` through `UIForm<...>`.
  // Checking `attrs` (built from the generic `InputField<O>` above) against that recursive,
  // `any`-erased shape trips a TS structural-variance false positive that doesn't occur at a
  // literal call site with a concrete `O`. Routing the cast through `unknown` (rather than
  // widening a parameter to `any`) keeps it scoped to this one call, not the function's
  // public signature, so callers of `invokePlugin` are still fully type-checked; the real,
  // checked contract for plugin authors remains `PluginType` in
  // `mithril-ui-form-plugin/src/plugin.ts`.
  return m(plugin, attrs as unknown as Parameters<typeof plugin>[0]['attrs']);
};

/**
 * Calls a registered field-type renderer with the render context built for this field.
 * Like `invokePlugin` above, `FieldRenderContext<O>` (built with the view's own concrete
 * `O`) can't be passed directly to a `FieldRenderer<any>` parameter without tripping the
 * same `InputField.type`-self-references-`InputField`-via-`UIForm` recursive-generic false
 * positive - routed through `unknown` here too, scoped to this one call.
 */
const runFieldRenderer = <O extends Attributes = {}>(renderer: FieldRenderer, ctx: FieldRenderContext<O>) =>
  renderer(ctx as unknown as FieldRenderContext<any>);

export const FormFieldFactory =
  (plugins: Record<string, PluginType> = {}, readonlyPlugins: Record<string, PluginType> = {}) =>
  <O extends Attributes = {}>(): Component<IFormField<O>> => {
    // Create state in closure - this creates a new state per component instance
    const state = {
      key: Date.now(),
      stableId: undefined as string | undefined,
    };

    return {
      oninit: ({ attrs: { field, obj } }) => {
        const { id = '' } = field;
        const formContext = obj && typeof obj === 'object' && 'id' in obj ? String(obj.id) : 'default';
        // Generate stable ID once during initialization
        state.stableId = generateFormFieldId(String(id), formContext);
      },
      view: ({
        attrs: {
          i18n: formI18n,
          field,
          obj,
          autofocus,
          onchange: onFormChange,
          context = [],
          containerId,
          disabled: d,
          readonly: r,
        },
      }) => {
        const {
          id = '',
          type: fieldType,
          disabled = d,
          readonly = r,
          value,
          required,
          autogenerate,
          show,
          label,
          description,
          i18n = formI18n || {},
          checkAllOptions,
          transform,
          effect,
          onkeyup,
          onkeydown,
          onblur,
        } = field;
        // Evaluate show condition
        const showResult = show ? evalExpression(show, obj, ...context) : true;

        if (
          (show && !showResult) ||
          (label && !canResolvePlaceholders(label, obj, ...context)) ||
          (value && !canResolvePlaceholders(value, obj, ...context)) ||
          (description && !canResolvePlaceholders(description, obj, ...context))
        ) {
          return undefined;
        }

        const opt =
          typeof field.options === 'string' ? resolveExpression(field.options, [obj, ...context]) : field.options;
        const options = (
          opt && opt instanceof Array
            ? opt
                .filter((o) => {
                  // Handle string options (convert to objects with id and label)
                  if (typeof o === 'string') {
                    return true;
                  }
                  // Handle object options (existing logic)
                  return (
                    typeof o.id !== 'undefined' &&
                    (o.label || isNaN(Number(o.id))) &&
                    (!o.show || evalExpression(o.show, obj, ...context))
                  );
                })
                .map((o) => {
                  // Convert string options to objects
                  if (typeof o === 'string') {
                    return { id: o, label: capitalizeFirstLetter(o) };
                  }
                  // Handle object options (existing logic)
                  return o.label ? o : { ...o, label: capitalizeFirstLetter(o.id) };
                })
            : []
        ) as Array<Option>;
        // { id: string; label: string; disabled?: boolean; icon?: string; show?: string | string[] }>;

        const parentIsDisabled = typeof d === 'boolean' && d;

        const formContext = obj && typeof obj === 'object' && 'id' in obj ? String(obj.id) : 'default';
        const props = unwrapComponent(
          field,
          autofocus,
          typeof disabled === 'boolean' || typeof disabled === 'undefined'
            ? parentIsDisabled || disabled
            : parentIsDisabled || evalExpression(disabled, obj, ...context),
          formContext,
          obj,
          state.stableId
        );

        if (label) {
          props.label = render(resolvePlaceholders(props.label || label, obj, ...context), true);
        }
        if (typeof value !== 'undefined') {
          if (typeof value === 'string') {
            props.value = resolvePlaceholders(props.value || value, obj, ...context);
          } else {
            props.value = value;
          }
        }
        if (description) {
          props.description = render(resolvePlaceholders(props.description || description, obj, ...context), true);
        }

        const validate = required
          ? (v: string | number | Array<string | number>) =>
              v instanceof Array ? v && v.length > 0 : typeof v !== undefined
          : undefined;

        if (obj instanceof Array) {
          console.warn('Only a repeat list can deal with arrays!');
          return undefined; // Only a repeat list can deal with arrays
        }

        const oninput = async (v: string | number | Array<string | number | Record<string, any>> | Date | boolean) => {
          if (typeof v === 'undefined' || v === 'undefined') {
            delete obj[id as keyof O];
            onFormChange(obj);
            return;
          }
          obj[id as keyof O] = transform ? transform('to', v) : (v as any);
          if (!effect) {
            // console.log(`onFormChange invoked: ${v}`);
            return onFormChange(obj);
          }
          const res = await effect(obj, obj[id as keyof O], context);
          if (typeof res !== 'undefined') {
            // res.then((r) => (r ? onFormChange(r) : onFormChange(obj)));
            onFormChange(res);
          } else {
            onFormChange(obj);
          }
        };

        if (fieldType instanceof Array) {
          type P = O[keyof O];
          if (id) {
            if (typeof obj === 'object' && !(obj as object).hasOwnProperty(id)) {
              obj[id] = {} as P;
            }

            return m('.muf-form', { className: field.className }, [
              m('.muf-form-header', m.trust(render(props.label || capitalizeFirstLetter(String(id)), true))),
              props.description && m('div', m.trust(render(props.description))),
              m(
                '.row',
                m(LayoutForm, {
                  ...props,
                  i18n,
                  readonly,
                  form: fieldType as UIForm<P>,
                  obj: obj[id],
                  context: context instanceof Array ? [obj, ...context] : [obj, context],
                  onchange: () => onFormChange && onFormChange(obj),
                  // oninput: (_isValid: boolean, updatedNestedObj: P) => {
                  //   obj[id] = updatedNestedObj;
                  //   onFormChange && onFormChange(obj);
                  // },
                  containerId,
                } as FormAttributes<P>)
              ),
            ]);
          } else {
            console.warn('Missing ID for type ' + JSON.stringify(fieldType));
            return undefined; // Only a repeat list can deal with arrays
          }
        }

        if (autogenerate && !obj[id]) {
          obj[id] = (autogenerate === 'guid' ? uuid4() : autogenerate === 'id' ? uniqueId() : Date.now()) as any;
        }

        const iv =
          typeof obj === 'object' && (obj as object).hasOwnProperty(id) && typeof obj[id] !== 'undefined'
            ? transform
              ? transform('from', obj[id])
              : obj[id]
            : props.value;
        if (id && typeof value !== 'undefined' && typeof iv !== 'undefined') {
          obj[id] = transform ? transform('to', iv) : iv; // Initial value was set, so use it.
        }

        const [selectAll, unselectAll] = checkAllOptions ? checkAllOptions.split('|') : ['', ''];

        const renderCtx: FieldRenderContext<O> = {
          fieldType: fieldType as string,
          field,
          obj,
          id: String(id),
          iv,
          props,
          options,
          i18n,
          context,
          oninput,
          onblur,
          onkeyup,
          onkeydown,
          autofocus,
          containerId,
          validate,
          selectAll,
          unselectAll,
          state,
        };

        if (readonly && fieldType) {
          if (readonlyPlugins.hasOwnProperty(fieldType))
            return invokePlugin(readonlyPlugins[fieldType], 'readonly', iv, field, props, obj, context, oninput);
          if (plugins.hasOwnProperty(fieldType)) {
            return invokePlugin(plugins[fieldType], 'editable', iv, field, props, obj, context, oninput);
          }
          if (['md', 'none'].indexOf(fieldType as string) < 0) {
            const renderer = readonlyFieldRenderers[fieldType as string];
            return runFieldRenderer(renderer || defaultReadonly, renderCtx);
          }
          // 'md'/'none' with no plugin registered: fall through to the editable dispatch
          // below. The built-in markdown renderer is display-only regardless of `readonly`
          // (see field-types/markdown.ts), and 'none' has no editable renderer either
          // (renders nothing either way) - so this preserves prior behavior for both. A
          // registered `readonlyPlugins['md']`/`plugins['md']` is still checked above first,
          // which is the whole point of allowing 'md' into this branch: previously this
          // guard excluded 'md' from ever reaching the plugin registries at all, so a
          // dedicated readonly markdown plugin (e.g. a WYSIWYG editor's readonly variant)
          // could never fire.
        }
        // Editable
        if (fieldType && plugins.hasOwnProperty(fieldType)) {
          return invokePlugin(plugins[fieldType], 'editable', iv, field, props, obj, context, oninput);
        }
        const renderer = editableFieldRenderers[fieldType as string];
        return renderer && runFieldRenderer(renderer, renderCtx);
      },
    } as Component<IFormField<O>>;
  };
