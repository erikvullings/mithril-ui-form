import m, { Attributes, Component } from 'mithril';
import { PluginType, InputField, I18n, FormAttributes, UIForm, Option } from 'mithril-ui-form-plugin';
import { render } from 'slimdown-js';
import {
  InputCheckbox,
  TextInput,
  TextArea,
  FileInput,
  UrlInput,
  NumberInput,
  DatePicker,
  TimePicker,
  ColorInput,
  EmailInput,
  RadioButtons,
  Select,
  Chips,
  ChipData,
  Options,
  Switch,
  uuid4,
  uniqueId,
  FlatButton,
  Autocomplete,
} from 'mithril-materialized';
import {
  capitalizeFirstLetter,
  toHourMin,
  evalExpression,
  canResolvePlaceholders,
  resolvePlaceholders,
  resolveExpression,
  extractTitle,
} from '../utils';
import { LayoutForm } from './layout-form';
import { ReadonlyComponent } from './readonly';
import { SlimdownView } from './slimdown-view';

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
        if (value) {
          props.value = resolvePlaceholders(props.value || value, obj, ...context);
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
                  oninput: () => onFormChange && onFormChange(obj),
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

        if (readonly && fieldType && ['md', 'none'].indexOf(fieldType as string) < 0) {
          if (readonlyPlugins.hasOwnProperty(fieldType))
            return m(readonlyPlugins[fieldType], {
              iv,
              field,
              props,
              label: props.label,
              obj,
              context,
            });
          if (fieldType && plugins.hasOwnProperty(fieldType)) {
            return m(plugins[fieldType], {
              iv,
              field,
              props,
              label: props.label,
              onchange: oninput,
              obj,
              context,
            });
          }
          switch (fieldType) {
            case 'time': {
              const d = iv as Date | number | string | undefined;
              const dto: Intl.DateTimeFormatOptions | undefined = i18n.dateTimeOptions
                ? {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: undefined,
                    ...i18n.dateTimeOptions,
                    weekday: undefined,
                    month: undefined,
                    day: undefined,
                    year: undefined,
                  }
                : undefined;
              const date =
                typeof d === 'number' || typeof d === 'string' || d instanceof Date ? new Date(d) : undefined;
              const initialValue = date ? date.toLocaleTimeString(i18n.locales, dto) : '';
              return m(ReadonlyComponent, {
                props,
                label: props.label,
                initialValue,
              });
            }
            case 'date': {
              const d = iv as Date | number | string | undefined;
              const dto: Intl.DateTimeFormatOptions | undefined = i18n.dateTimeOptions
                ? { ...i18n.dateTimeOptions, hour: undefined, hour12: undefined, minute: undefined, second: undefined }
                : undefined;
              const date =
                typeof d === 'number' || typeof d === 'string' || d instanceof Date ? new Date(d) : undefined;
              const initialValue = date ? date.toLocaleDateString(i18n.locales, dto) : '';
              return m(ReadonlyComponent, {
                props,
                label: props.label,
                initialValue,
              });
            }
            case 'datetime': {
              const d = iv as Date | number | string | undefined;
              const dto: Intl.DateTimeFormatOptions | undefined = i18n.dateTimeOptions
                ? { hour: '2-digit', minute: '2-digit', month: 'numeric', day: 'numeric', ...i18n.dateTimeOptions }
                : undefined;
              const date =
                typeof d === 'number' || typeof d === 'string' || d instanceof Date ? new Date(d) : undefined;
              const initialValue = date ? date.toLocaleTimeString(i18n.locales, dto) : '';
              return m(ReadonlyComponent, {
                props,
                label: props.label,
                initialValue,
              });
            }
            case 'switch':
            case 'checkbox': {
              const checked = iv as boolean;
              const initialValue = checked ? '✔' : '✘';
              return m(ReadonlyComponent, {
                props,
                label: props.label,
                initialValue,
                inline: true,
              });
            }
            case 'tags': {
              const initialValue = (iv || []) as string[];
              return m(ReadonlyComponent, {
                props,
                label: props.label,
                initialValue,
              });
            }
            case 'options':
            case 'select': {
              const checkedIds = (typeof iv !== 'undefined' ? ((iv as any) instanceof Array ? iv : [iv]) : []) as Array<
                string | number
              >;
              const selected = options.filter((o) => checkedIds.indexOf(o.id) >= 0);
              const initialValue =
                selected && selected.length === 0
                  ? '?'
                  : selected.length === 1
                  ? selected[0].label
                  : selected.map((o) => o.label);
              return m(ReadonlyComponent, {
                props,
                label: props.label,
                initialValue,
              });
            }
            case 'radio': {
              const checkedId = iv as string | number;
              const selected = options.filter((o) => o.id === checkedId);
              const initialValue = selected && selected.length ? selected[0].label : '?';
              return m(ReadonlyComponent, {
                props,
                label: props.label,
                initialValue,
              });
            }
            case 'base64': {
              const value = iv as string | undefined;
              const isImg = value && /data:image/i.test(value) ? true : false;
              const altText = field.label || extractTitle(obj) || field.placeholder || 'Uploaded image';
              return (
                isImg &&
                m(
                  'div',
                  { role: 'img', 'aria-label': typeof altText === 'string' ? altText : 'Image' },
                  m('img.responsive-img', {
                    src: value,
                    alt: typeof altText === 'string' ? altText : 'Image',
                    style: { maxHeight: `${field.max || 50}px` },
                  })
                )
              );
            }
            case 'file': {
              const value = iv as string | string[] | undefined;
              const ivFinal = value instanceof Array ? value : [value];
              return m(
                'div',
                props,
                ivFinal.map((f = '') => {
                  const isImg = /data:image|.jpg$|.jpeg$|.png$|.gif$|.svg$|.bmp$|.tif$|.tiff$/i.test(f);
                  const origin = new URL(field.url!).origin;
                  const url = `${origin}${f}`;
                  return m(
                    'a[target=_blank]',
                    { href: url },
                    isImg
                      ? m('img', {
                          src: url,
                          alt: field.label || field.placeholder || f || 'File image',
                          style: { maxHeight: `${field.max || 50}px` },
                        })
                      : m(ReadonlyComponent, {
                          props,
                          label: field.placeholder || 'File',
                          initialValue: f,
                        })
                  );
                })
              );
            }
            case 'md':
            case 'markdown': {
              const initialValue = typeof iv === 'string' && iv ? render(iv as string) : '';
              return m(ReadonlyComponent, {
                props,
                label: props.label,
                initialValue,
              });
            }
            default: {
              const initialValue = iv as string;
              return m(ReadonlyComponent, {
                props,
                type: fieldType,
                label: props.label,
                initialValue,
              });
            }
          }
        } else {
          // Editable
          if (fieldType && plugins.hasOwnProperty(fieldType)) {
            return m(plugins[fieldType], {
              iv,
              field,
              props,
              label: props.label,
              onchange: oninput,
              obj,
              context,
            });
          }
          switch (fieldType) {
            case 'colour':
            case 'color': {
              const value = iv as string;
              return m(ColorInput, { ...props, value, oninput, onblur });
            }
            case 'time': {
              const { twelveHour = false } = props;
              const date: Date = iv
                ? typeof iv === 'number' || typeof iv === 'string'
                  ? new Date(iv)
                  : (iv as Date)
                : new Date();
              const value = toHourMin(date);
              (obj[id] as any) = transform ? transform('to', date) : date;
              return m(TimePicker, {
                ...props,
                twelveHour,
                value,
                oninput: (time: string) => {
                  const tt = time.split(':').map((n) => +n);
                  date.setHours(tt[0], tt[1]);
                  oninput(date);
                },
                container: containerId,
              });
            }
            case 'date': {
              const { format = 'mmmm d, yyyy' } = props;
              const value: Date = typeof iv === 'number' || typeof iv === 'string' ? new Date(iv) : (iv as Date);
              (obj[id] as any) = value ? (transform ? transform('to', value.valueOf()) : value.valueOf()) : value;
              // console.log(value && value.toUTCString());
              const { min, max } = props;
              const minDate = min ? (!value || min < value.valueOf() ? new Date(min) : value) : undefined;
              const maxDate = max ? (!value || max > value.valueOf() ? new Date(max) : value) : undefined;
              return m(DatePicker as any, {
                ...props,
                minDate,
                maxDate,
                setDefaultDate: value ? true : false,
                format,
                value,
                oninput: (date: Date | string) => {
                  oninput(new Date(date));
                  // m.redraw();
                },
                container: containerId as any,
              });
            }
            case 'datetime': {
              const {
                label,
                className = 'col s12',
                dateTimeSeconds = false,
                twelveHour = false,
                format = 'mmmm d, yyyy',
                ...params
              } = props;
              const initialDateTime: Date =
                typeof iv === 'number' || typeof iv === 'string' ? new Date(iv) : (iv as Date);
              const state = { initialDateTime };
              const initialDate = initialDateTime ? initialDateTime : undefined;
              const initialTime = initialDateTime ? toHourMin(initialDateTime) : '';
              const { min, max } = props;
              const minDate = min
                ? !initialDateTime || min < initialDateTime.valueOf()
                  ? new Date(min)
                  : initialDateTime
                : undefined;
              const maxDate = max
                ? !initialDateTime || max > initialDateTime.valueOf()
                  ? new Date(max)
                  : initialDateTime
                : undefined;
              const outputFormat = props.dateTimeOutput || 'UTC';
              const notify = (d: Date) => {
                state.initialDateTime = d;
                oninput(
                  outputFormat === 'UTC' ? d.toUTCString() : outputFormat === 'ISO' ? d.toISOString() : d.valueOf()
                );
              };
              return m(
                'div',
                { className },
                m('.row', [
                  m(
                    dateTimeSeconds ? '.col.s6' : '.col.s8',
                    { style: 'padding: 0' },
                    m(DatePicker as any, {
                      ...params,
                      label,
                      minDate,
                      maxDate,
                      setDefaultDate: initialDateTime ? true : false,
                      format,
                      value: initialDate,
                      container: containerId as any,
                      oninput: (date: Date) => {
                        const d = new Date(state.initialDateTime);
                        d.setFullYear(date.getFullYear());
                        d.setMonth(date.getMonth());
                        d.setDate(date.getDate());
                        notify(d);
                      },
                    })
                  ),
                  m(
                    '.col.s4',
                    { style: 'min-width: 6rem; padding-right: 0; padding-left: 0' },
                    m(TimePicker, {
                      ...params,
                      label: '',
                      helperText: '',
                      twelveHour,
                      value: initialTime,
                      container: containerId,
                      oninput: (time: string) => {
                        const tt = time.split(':').map((n) => +n);
                        const d = state.initialDateTime || new Date(new Date().setSeconds(0, 0));
                        d.setHours(tt[0], tt[1]);
                        notify(d);
                      },
                    })
                  ),
                  dateTimeSeconds &&
                    m(NumberInput, {
                      style: 'min-width: 4rem; padding-right: 0; padding-left: 0',
                      className: 'col s2',
                      min: 0,
                      max: 59,
                      oninput: (n: number) => {
                        const d = state.initialDateTime || new Date(new Date().setSeconds(0, 0));
                        d.setSeconds(n, 0);
                        notify(d);
                      },
                    }),
                ])
              );
            }
            case 'email': {
              const value = iv as string;
              return m(EmailInput, {
                ...props,
                validate,
                autofocus,
                oninput,
                value,
                onkeydown,
                onkeyup,
                onblur,
              });
            }
            case 'number': {
              const value = iv as number;
              return m(NumberInput, {
                ...props,
                validate,
                autofocus,
                oninput,
                value,
                onkeydown,
                onkeyup,
                onblur,
              });
            }
            case 'radio': {
              const checkedId = iv as string | number;
              return m(RadioButtons, {
                label: '',
                ...props,
                options,
                checkedId,
                onchange: oninput,
              });
            }
            case 'checkbox': {
              const checked = Boolean(iv);
              return m(InputCheckbox, { ...props, checked, oninput });
            }
            case 'options': {
              const checkedId = iv as Array<string | number>;
              return [
                [
                  m(Options<any>, {
                    key: state.key,
                    checkboxClass: 'col s6 m4 l3',
                    className: 'input-field col s12',
                    ...props,
                    disabled: props.disabled || !options || options.length === 0,
                    options,
                    checkedId,
                    onchange: (checkedIds: string[]) =>
                      oninput(checkedIds.length === 1 ? checkedIds[0] : checkedIds.filter((v) => v !== null)),
                  }),
                ],
                typeof checkAllOptions !== 'undefined' &&
                  m('.col.s12.option-buttons', [
                    m(FlatButton, {
                      disabled: props.disabled,
                      label: selectAll,
                      iconName: 'check',
                      onclick: () => {
                        state.key = Date.now();
                        oninput(options.map((o) => (typeof o === 'string' ? o : o.id)));
                      },
                    }),
                    unselectAll &&
                      m(FlatButton, {
                        disabled: props.disabled,
                        label: unselectAll,
                        iconName: 'check_box_outline_blank',
                        onclick: () => {
                          const ids = (obj[id] || []) as Array<string | number>;
                          ids.length = 0;
                          state.key = Date.now();
                          oninput(ids);
                        },
                      }),
                  ]),
              ];
            }
            case 'select': {
              const checkedId = iv as Array<string | number>;
              return m(Select<any>, {
                placeholder: props.multiple ? i18n.pickOneOrMore || 'Pick one or more' : i18n.pickOne || 'Pick one',
                ...props,
                disabled: props.disabled || !options || options.length === 0,
                options,
                checkedId,
                onchange: (checkedIds: string[]) =>
                  oninput(
                    checkedIds.length === 1 && !props.multiple
                      ? checkedIds[0]
                      : checkedIds.filter((v) => v !== null || typeof v !== 'undefined')
                  ),
              });
            }
            case 'markdown':
            case 'md': {
              const { label, className = 'col s12' } = props;
              const md = resolvePlaceholders((id ? iv : value || label) || '', obj, ...context);
              return m(SlimdownView, { md, className });
            }
            case 'section':
              return m('.divider');
            case 'switch': {
              const checked = iv as boolean;
              // const { options: opt } = field;
              const left = options && options.length > 0 ? options[0].label ?? '' : '';
              const right = options && options.length > 1 ? options[1].label ?? '' : '';
              return m(Switch, { ...props, left, right, checked, onchange: oninput });
            }
            case 'tags': {
              const value = (iv ? ((iv as any) instanceof Array ? iv : [iv]) : []) as string[];
              const data = value.map((chip) => ({ tag: chip }));
              const autocompleteOptions =
                options && options.length > 0
                  ? {
                      data: options.reduce((acc, cur) => {
                        acc[cur.id] = null;
                        return acc;
                      }, {} as { [key: string]: null }),
                      limit: field.maxLength || Infinity,
                      minLength: field.minLength || 1,
                    }
                  : undefined;
              const { label, isMandatory, className, helperText } = props;
              return m(Chips, {
                className,
                label,
                isMandatory,
                helperText,
                placeholder: field.placeholder || 'Add a tag',
                secondaryPlaceholder: field.secondaryPlaceholder || '+tag',
                data,
                onchange: (chips: ChipData[]) => oninput(chips.map((chip) => chip.tag)),
                autocompleteOptions,
                // onblur,
              });
            }
            case 'autocomplete': {
              const value = iv as string;
              const autocompleteOptions =
                options && options.length > 0
                  ? {
                      data: options.reduce((acc, cur) => {
                        acc[cur.id] = null;
                        return acc;
                      }, {} as { [key: string]: null }),
                      limit: field.maxLength || Infinity,
                      minLength: field.minLength || 1,
                    }
                  : { data: {} };
              const { label, isMandatory, className, helperText } = props;
              return m(Autocomplete, {
                value,
                className,
                label,
                isMandatory,
                helperText,
                oninput,
                onblur,
                placeholder: field.placeholder || '...',
                ...autocompleteOptions,
              });
            }
            case 'textarea': {
              const value = iv as string;
              return m(TextArea, {
                ...props,
                validate,
                autofocus,
                oninput,
                value,
                onkeyup,
                onkeydown,
                onblur,
              });
            }
            case 'file': {
              const value = iv as string;
              const { url, placeholder } = field;
              if (!url) {
                throw Error('Input field "url" not defined, which indicates the URL to the upload folder.');
              }
              const accept = options ? options.map((o) => (typeof o === 'string' ? o : String(o.id))) : undefined;
              const upload = (file: FileList) => {
                if (!file || file.length < 1) {
                  oninput('');
                  return;
                }
                const body = new FormData();
                body.append('file', file[0]);
                m.request<string>({
                  method: 'POST',
                  url,
                  body,
                })
                  .then((res) => oninput(res))
                  .catch(console.error);
              };
              return m(FileInput, {
                ...props,
                accept,
                placeholder,
                onchange: upload,
                value,
              });
            }
            case 'base64': {
              const value = iv as string;
              const isImg = value && /data:image/i.test(value) ? true : false;
              const { placeholder } = field;
              const accept = options ? options.map((o) => (typeof o === 'string' ? o : o.id)).join(',') : undefined;
              const upload = (file: FileList) => {
                if (!file || file.length < 1) {
                  oninput('');
                  return;
                }
                const reader = new FileReader();
                reader.onloadend = () => {
                  typeof reader.result === 'string' && oninput(reader.result);
                  m.redraw();
                };

                reader.readAsDataURL(file[0]);
              };
              const altText = field.label || extractTitle(obj) || field.placeholder || 'Uploaded image';
              return isImg
                ? m('div', [
                    m('img.responsive-img', {
                      src: value,
                      alt: typeof altText === 'string' ? altText : 'Uploaded image',
                      style: { maxHeight: `${field.max || 50}px` },
                    }),
                    m(FlatButton, {
                      iconName: 'clear',
                      'aria-label': 'Remove image',
                      onclick: () => oninput(''),
                    }),
                  ])
                : m(FileInput, {
                    ...props,
                    accept,
                    placeholder,
                    oninput: upload,
                    value,
                  });
            }
            case 'url': {
              const value = iv as string;
              return m(UrlInput, {
                placeholder: 'http(s)://www.example.com',
                // dataError: 'http(s)://www.example.com',
                // dataSuccess: 'OK',
                ...props,
                validate,
                autofocus,
                oninput,
                value,
                onkeydown,
                onkeyup,
                onblur,
              });
            }
            case 'text': {
              const value = iv as string;
              return m(TextInput, {
                ...props,
                maxLength: field.max || undefined,
                validate,
                autofocus,
                oninput,
                value,
                onkeydown,
                onkeyup,
                onblur,
              });
            }
            default:
              return undefined;
          }
        }
      },
    } as Component<IFormField<O>>;
  };
