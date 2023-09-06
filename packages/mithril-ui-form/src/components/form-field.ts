import m, { Attributes, Component } from 'mithril';
import { PluginType, InputField, I18n, FormAttributes, UIForm } from 'mithril-ui-form-plugin';
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
} from '../utils';
import { LayoutForm } from './layout-form';
import { ReadonlyComponent } from './readonly';
import { SlimdownView } from './slimdown-view';

const unwrapComponent = <O extends Record<string, any> = {}>(
  field: InputField<O>,
  autofocus = false,
  disabled = false
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
  const result = { id: `mui_${String(id)}-${uniqueId()}`, label } as Record<string, any>;
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
  }
  if (multiple) {
    result.multiple = multiple;
  }
  if (disabled) {
    result.disabled = true;
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

export const CreateFormField =
  (plugins: Record<string, PluginType> = {}, readonlyPlugins: Record<string, PluginType> = {}) =>
  <O extends Attributes = {}>(): Component<IFormField<O>> => {
    const state = { key: Date.now() } as { key: number };

    return {
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
          type,
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
        } = field;
        if (
          (show && !evalExpression(show, obj, context)) ||
          (label && !canResolvePlaceholders(label, obj, context)) ||
          (description && !canResolvePlaceholders(description, obj, context))
        ) {
          // console.table({ show, obj, context });
          return undefined;
        }

        const opt =
          typeof field.options === 'string' ? resolveExpression(field.options, [obj, ...context]) : field.options;
        const options = (
          opt && opt instanceof Array
            ? opt
                .filter(
                  (o) =>
                    typeof o.id !== 'undefined' &&
                    (o.label || !/[0-9]/.test(o.id)) &&
                    (!o.show || evalExpression(o.show, obj, context))
                )
                .map((o) => (o.label ? o : { ...o, label: capitalizeFirstLetter(o.id) }))
            : []
        ) as Array<{ id: string; label: string; disabled?: boolean; icon?: string; show?: string | string[] }>;

        const parentIsDisabled = typeof d === 'boolean' && d;

        const props = unwrapComponent(
          field,
          autofocus,
          typeof disabled === 'boolean' || typeof disabled === 'undefined'
            ? parentIsDisabled || disabled
            : parentIsDisabled || evalExpression(disabled, obj, context)
        );

        if (label) {
          props.label = render(resolvePlaceholders(props.label || label, obj, context), true);
        }
        if (description) {
          props.description = render(resolvePlaceholders(props.description || description, obj, context), true);
        }

        const validate = required
          ? (v: string | number | Array<string | number>) =>
              v instanceof Array ? v && v.length > 0 : typeof v !== undefined
          : undefined;

        if (obj instanceof Array) {
          console.warn('Only a repeat list can deal with arrays!');
          return undefined; // Only a repeat list can deal with arrays
        }

        const onchange = async (v: string | number | Array<string | number | Record<string, any>> | Date | boolean) => {
          // console.log(`Onchange invoked: ${v}`);
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

        if (type instanceof Array) {
          type P = O[keyof O];
          if (id) {
            if (!obj.hasOwnProperty(id)) {
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
                  form: type as UIForm<P>[],
                  obj: obj[id],
                  context: context instanceof Array ? [obj, ...context] : [obj, context],
                  onchange: () => onFormChange && onFormChange(obj),
                  containerId,
                } as FormAttributes)
              ),
            ]);
          } else {
            console.warn('Missing ID for type ' + JSON.stringify(type));
            return undefined; // Only a repeat list can deal with arrays
          }
        }

        if (autogenerate && !obj[id]) {
          obj[id] = (autogenerate === 'guid' ? uuid4() : autogenerate === 'id' ? uniqueId() : Date.now()) as any;
        }

        const iv =
          obj.hasOwnProperty(id) && typeof obj[id] !== 'undefined'
            ? transform
              ? transform('from', obj[id])
              : obj[id]
            : value;
        if (id && typeof value !== 'undefined' && typeof iv !== 'undefined') {
          obj[id] = transform ? transform('to', iv) : iv; // Initial value was set, so use it.
        }

        const [selectAll, unselectAll] = checkAllOptions ? checkAllOptions.split('|') : ['', ''];

        if (readonly && type && ['md', 'none'].indexOf(type as string) < 0) {
          if (readonlyPlugins.hasOwnProperty(type))
            return m(readonlyPlugins[type], {
              iv,
              field,
              props,
              label: props.label,
              obj,
              context,
            });
          if (type && plugins.hasOwnProperty(type)) {
            return m(plugins[type], {
              iv,
              field,
              props,
              label: props.label,
              onchange,
              obj,
              context,
            });
          }
          switch (type) {
            case 'time': {
              const date = (iv as Date) || new Date();
              const initialValue = toHourMin(date);
              return m(ReadonlyComponent, {
                props,
                label: props.label,
                initialValue,
              });
            }
            case 'date': {
              const iv3 = iv as Date | undefined;
              const initialValue =
                typeof iv3 === 'number' || typeof iv3 === 'string' || iv3 instanceof Date
                  ? new Date(iv3).toLocaleDateString()
                  : '';
              return m(ReadonlyComponent, {
                props,
                label: props.label,
                initialValue,
              });
            }
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
              const initialValue = iv as string | undefined;
              const isImg = initialValue && /data:image/i.test(initialValue) ? true : false;
              return (
                isImg &&
                m(
                  'div',
                  m('img.responsive-img', {
                    src: initialValue,
                    alt: obj.title || obj.alt || obj.name || '',
                    style: `max-height: ${field.max || 50}px`,
                  })
                )
              );
            }
            case 'file': {
              const initialValue = iv as string | string[] | undefined;
              const ivFinal = initialValue instanceof Array ? initialValue : [initialValue];
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
                      ? m('img', { src: url, alt: url, style: `max-height: ${field.max || 50}` })
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
                type,
                label: props.label,
                initialValue,
              });
            }
          }
        } else {
          // Editable
          if (type && plugins.hasOwnProperty(type)) {
            return m(plugins[type], {
              iv,
              field,
              props,
              label: props.label,
              onchange,
              obj,
              context,
            });
          }
          switch (type) {
            case 'colour':
            case 'color': {
              const initialValue = iv as string;
              return m(ColorInput, { ...props, initialValue, onchange });
            }
            case 'time': {
              const { twelveHour = false } = props;
              const date: Date = iv
                ? typeof iv === 'number' || typeof iv === 'string'
                  ? new Date(iv)
                  : (iv as Date)
                : new Date();
              const initialValue = toHourMin(date);
              (obj[id] as any) = transform ? transform('to', date) : date;
              return m(TimePicker, {
                ...props,
                twelveHour,
                initialValue,
                onchange: (time: string) => {
                  const tt = time.split(':').map((n) => +n);
                  date.setHours(tt[0], tt[1]);
                  onchange(date);
                },
                container: containerId,
              });
            }
            case 'date': {
              const { format = 'mmmm d, yyyy' } = props;
              const initialValue: Date = typeof iv === 'number' || typeof iv === 'string' ? new Date(iv) : (iv as Date);
              (obj[id] as any) = initialValue
                ? transform
                  ? transform('to', initialValue.valueOf())
                  : initialValue.valueOf()
                : initialValue;
              // console.log(initialValue && initialValue.toUTCString());
              const { min, max } = props;
              const minDate = min
                ? !initialValue || min < initialValue.valueOf()
                  ? new Date(min)
                  : initialValue
                : undefined;
              const maxDate = max
                ? !initialValue || max > initialValue.valueOf()
                  ? new Date(max)
                  : initialValue
                : undefined;
              return m(DatePicker, {
                ...props,
                minDate,
                maxDate,
                setDefaultDate: initialValue ? true : false,
                format,
                initialValue,
                onchange: (date: Date | string) => {
                  onchange(new Date(date));
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
                onchange(
                  outputFormat === 'UTC' ? d.toUTCString() : outputFormat === 'ISO' ? d.toISOString() : d.valueOf()
                );
              };
              return m(
                'div',
                { className },
                m('.row', [
                  m(
                    dateTimeSeconds ? '.col.s6' : '.col.s8',
                    { style: 'padding-right: 0' },
                    m(DatePicker, {
                      ...params,
                      label,
                      minDate,
                      maxDate,
                      setDefaultDate: initialDateTime ? true : false,
                      format,
                      initialValue: initialDate,
                      container: containerId as any,
                      onchange: (date: Date) => {
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
                      initialValue: initialTime,
                      container: containerId,
                      onchange: (time: string) => {
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
                      onchange: (n: number) => {
                        const d = state.initialDateTime || new Date(new Date().setSeconds(0, 0));
                        d.setSeconds(n, 0);
                        notify(d);
                      },
                    }),
                ])
              );
            }
            case 'email': {
              const initialValue = iv as string;
              return m(EmailInput, {
                ...props,
                validate,
                autofocus,
                onchange,
                initialValue,
              });
            }
            case 'number': {
              const initialValue = iv as number;
              return m(NumberInput, {
                ...props,
                validate,
                autofocus,
                onchange,
                initialValue,
              });
            }
            case 'radio': {
              const checkedId = iv as string | number;
              return m(RadioButtons, {
                label: '',
                ...props,
                options,
                checkedId,
                onchange,
              });
            }
            case 'checkbox': {
              const checked = iv as boolean;
              return m(InputCheckbox, { ...props, checked, onchange });
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
                      onchange(checkedIds.length === 1 ? checkedIds[0] : checkedIds.filter((v) => v !== null)),
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
                        onchange(options.map((o) => o.id));
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
                          onchange(ids);
                        },
                      }),
                  ]),
              ];
            }
            case 'select': {
              const initialValue = iv as Array<string | number>;
              return m(Select<any>, {
                placeholder: props.multiple ? i18n.pickOneOrMore || 'Pick one or more' : i18n.pickOne || 'Pick one',
                ...props,
                disabled: props.disabled || !options || options.length === 0,
                options,
                initialValue,
                onchange: (checkedIds: string[]) =>
                  onchange(
                    checkedIds.length === 1 && !props.multiple
                      ? checkedIds[0]
                      : checkedIds.filter((v) => v !== null || typeof v !== 'undefined')
                  ),
              });
            }
            case 'markdown':
            case 'md': {
              const { label, className = 'col s12' } = props;
              const md = resolvePlaceholders((id ? iv : value || label) || '', obj, context);
              return m(SlimdownView, { md, className });
            }
            case 'section':
              return m('.divider');
            case 'switch': {
              const checked = iv as boolean;
              // const { options: opt } = field;
              const left = options && options.length > 0 ? options[0].label : '';
              const right = options && options.length > 1 ? options[1].label : '';
              return m(Switch, { ...props, left, right, checked, onchange });
            }
            case 'tags': {
              const initialValue = (iv ? ((iv as any) instanceof Array ? iv : [iv]) : []) as string[];
              const data = initialValue.map((chip) => ({ tag: chip }));
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
                  : {};
              const { label, isMandatory, className, helperText } = props;
              return m(Chips, {
                className,
                label,
                isMandatory,
                helperText,
                onchange: (chips: M.ChipData[]) => onchange(chips.map((chip) => chip.tag)),
                placeholder: field.placeholder || 'Add a tag',
                secondaryPlaceholder: field.secondaryPlaceholder || '+tag',
                data,
                autocompleteOptions,
              });
            }
            case 'autocomplete': {
              const initialValue = iv as string;
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
                initialValue,
                className,
                label,
                isMandatory,
                helperText,
                onchange,
                placeholder: field.placeholder || '...',
                ...autocompleteOptions,
              });
            }
            case 'textarea': {
              const initialValue = iv as string;
              return m(TextArea, {
                ...props,
                validate,
                autofocus,
                onchange,
                initialValue,
              });
            }
            case 'file': {
              const initialValue = iv as string;
              const { url, placeholder } = field;
              if (!url) {
                throw Error('Input field "url" not defined, which indicates the URL to the upload folder.');
              }
              const accept = options ? options.map((o) => o.id) : undefined;
              const upload = (file: FileList) => {
                if (!file || file.length < 1) {
                  onchange('');
                  return;
                }
                const body = new FormData();
                body.append('file', file[0]);
                m.request<string>({
                  method: 'POST',
                  url,
                  body,
                })
                  .then((res) => onchange(res))
                  .catch(console.error);
              };
              return m(FileInput, {
                ...props,
                accept,
                placeholder,
                onchange: upload,
                initialValue,
              });
            }
            case 'base64': {
              const initialValue = iv as string;
              const isImg = initialValue && /data:image/i.test(initialValue) ? true : false;
              const { placeholder } = field;
              const accept = options ? options.map((o) => o.id).join(',') : undefined;
              const upload = (file: FileList) => {
                if (!file || file.length < 1) {
                  onchange('');
                  return;
                }
                const reader = new FileReader();
                reader.onloadend = () => {
                  typeof reader.result === 'string' && onchange(reader.result);
                  m.redraw();
                };

                reader.readAsDataURL(file[0]);
              };
              return isImg
                ? m('div', [
                    m('img.responsive-img', {
                      src: initialValue,
                      alt: obj.title || obj.alt || obj.name || '',
                      style: `max-height: ${field.max || 50}px`,
                    }),
                    m(FlatButton, {
                      iconName: 'clear',
                      onclick: () => onchange(''),
                    }),
                  ])
                : m(FileInput, {
                    ...props,
                    accept,
                    placeholder,
                    onchange: upload,
                    initialValue,
                  });
            }
            case 'url': {
              const initialValue = iv as string;
              return m(UrlInput, {
                placeholder: 'http(s)://www.example.com',
                // dataError: 'http(s)://www.example.com',
                // dataSuccess: 'OK',
                ...props,
                validate,
                autofocus,
                onchange,
                initialValue,
              });
            }
            case 'text': {
              const initialValue = iv as string;
              return m(TextInput, {
                ...props,
                validate,
                autofocus,
                onchange,
                initialValue,
                tabindex: 15,
              });
            }
            default:
              return undefined;
          }
        }
      },
    } as Component<IFormField<O>>;
  };
