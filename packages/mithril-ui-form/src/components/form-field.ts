import m, { FactoryComponent, Attributes } from 'mithril';
import { LeafletMap } from 'mithril-leaflet';
import { geoJSON } from 'leaflet';
import { render } from 'slimdown-js';
import { FeatureGroup } from 'leaflet';
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
  Label,
  Select,
  Chips,
  Options,
  Switch,
  uuid4,
  uniqueId,
  Button,
} from 'mithril-materialized';
import { IInputField } from '../models/input-field';
import {
  capitalizeFirstLetter,
  toHourMin,
  evalExpression,
  canResolvePlaceholders,
  resolvePlaceholders,
} from '../utils';
import { IObject } from '../models/object';
import { GeometryObject, FeatureCollection } from 'geojson';
import { I18n } from '../models';
import { RepeatList, IRepeatList } from './repeat-list';
import { LayoutForm } from './layout-form';
import { ReadonlyComponent } from './readonly';
import { SlimdownView } from './slimdown-view';

const unwrapComponent = (field: IInputField, autofocus = false, disabled = false) => {
  const {
    id,
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
  } = field;
  const result = { id: `${id}-${uniqueId()}`, label } as IObject;
  if (!label && id) {
    result.label = capitalizeFirstLetter(id);
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
  return result;
};

interface IFormField extends Attributes {
  /** The input field (or form) that must be rendered repeatedly */
  field: IInputField;
  /** The resulting object */
  obj: IObject | IObject[];
  autofocus?: boolean;
  /** Callback function, invoked every time the original result object has changed */
  onchange: (result: IObject | IObject[]) => void;
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

/** A single input field in a form */
export const FormField: FactoryComponent<IFormField> = () => {
  const state = { key: Date.now() } as { key: number };

  return {
    view: ({
      attrs: {
        i18n: formI18n,
        field,
        obj,
        autofocus,
        onchange: onFormChange,
        context,
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
        repeat,
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

      const options = (field.options
        ? field.options
            .filter((o) => !o.show || evalExpression(o.show, obj, context))
            .map((o) => (o.label ? o : { ...o, label: capitalizeFirstLetter(o.id) }))
        : []) as Array<{ id: string; label: string; disabled?: boolean; icon?: string; show?: string | string[] }>;

      const parentIsDisabled = typeof d === 'boolean' && d;

      const props = unwrapComponent(
        field,
        autofocus,
        typeof disabled === 'boolean' || typeof disabled === 'undefined'
          ? parentIsDisabled || disabled
          : parentIsDisabled || evalExpression(disabled, obj, context)
      );

      if (label) {
        props.label = resolvePlaceholders(props.label, obj, context);
      }
      if (description) {
        props.description = resolvePlaceholders(props.description, obj, context);
      }

      const validate = required
        ? (v: string | number | Array<string | number>) =>
            v instanceof Array ? v && v.length > 0 : typeof v !== undefined
        : undefined;

      if (typeof repeat !== 'undefined') {
        return m(RepeatList, {
          obj,
          field,
          onchange: onFormChange,
          context,
          i18n,
          containerId,
          disabled,
          readonly,
        } as IRepeatList);
      }

      if (obj instanceof Array) {
        return undefined; // Only a repeat list can deal with arrays
      }

      const onchange = async (v: string | number | Array<string | number | IObject> | Date | boolean) => {
        if (typeof v === 'undefined' || v === 'undefined') {
          delete obj[id];
          onFormChange(obj);
          return;
        }
        obj[id] = transform ? transform('to', v) : (v as any);
        if (!effect) {
          return onFormChange(obj);
        }
        const res = await effect(obj, obj[id], context);
        if (typeof res !== 'undefined') {
          // res.then((r) => (r ? onFormChange(r) : onFormChange(obj)));
          onFormChange(res);
        } else {
          onFormChange(obj);
        }
      };

      if (type instanceof Array) {
        if (field.id) {
          if (!obj.hasOwnProperty(field.id)) {
            obj[field.id] = {};
          }
          return m('div', { className: field.className }, [
            m('div', m.trust(render(props.label || capitalizeFirstLetter(field.id), true))),
            props.description && m('div', m.trust(render(props.description))),
            m(LayoutForm, {
              ...props,
              i18n,
              readonly,
              form: type,
              obj: obj[field.id],
              context: [obj, context],
              onchange: () => onFormChange(obj),
              containerId,
            }),
          ]);
        }
      }

      const iv =
        obj.hasOwnProperty(id) && typeof obj[id] !== 'undefined'
          ? transform
            ? transform('from', obj[id])
            : obj[id]
          : value;
      if (id && value && iv) {
        obj[id] = transform ? transform('to', iv) : iv; // Initial value was set, so use it.
      }
      if (autogenerate && !obj[id]) {
        obj[id] = (autogenerate === 'guid' ? uuid4() : autogenerate === 'id' ? uniqueId() : Date.now()) as any;
      }

      const [selectAll, unselectAll] = checkAllOptions ? checkAllOptions.split('|') : ['', ''];

      if (readonly && type && ['md', 'map', 'none'].indexOf(type as string) < 0) {
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
            const checkedIds = (iv || []) as Array<string | number>;
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
              initialValue,
            });
          }
          case 'file': {
            const initialValue = iv as string | string[];
            const ivFinal = initialValue instanceof Array ? initialValue : [initialValue];
            return m(
              'div',
              props,
              ivFinal.map((f) => {
                const isImg = /.jpg$|.jpeg$|.png$|.gif$|.svg$|.bmp$|.tif$|.tiff$/i.test(f);
                const origin = new URL(field.url || '/').origin;
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
          default: {
            const initialValue = iv as string;
            return m(ReadonlyComponent, {
              props,
              label: props.label,
              initialValue,
            });
          }
        }
      } else {
        switch (type) {
          case 'colour':
          case 'color': {
            const initialValue = iv as string;
            return m(ColorInput, { ...props, initialValue, onchange });
          }
          case 'time': {
            const date = iv
              ? typeof iv === 'number' || typeof iv === 'string'
                ? new Date(iv)
                : (iv as Date)
              : new Date();
            const initialValue = toHourMin(date);
            obj[id] = transform ? transform('to', date) : date;
            return m(TimePicker, {
              twelveHour: false,
              ...props,
              initialValue,
              onchange: (time) => {
                const tt = time.split(':').map((n) => +n);
                date.setHours(tt[0], tt[1]);
                onchange(date);
              },
              container: containerId,
            });
          }
          case 'date': {
            const initialValue = typeof iv === 'number' || typeof iv === 'string' ? new Date(iv) : iv;
            obj[id] = initialValue
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
              format: 'mmmm d, yyyy',
              initialValue,
              onchange: (date) => {
                onchange(new Date(date));
                // m.redraw();
              },
              container: containerId as any,
            });
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
              ...props,
              label: '',
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
              m(
                '.row',
                [
                  m(Options, {
                    key: state.key,
                    checkboxClass: 'col s6 m4 l3',
                    className: 'input-field col s12',
                    ...props,
                    disabled: props.disabled || !options || options.length === 0,
                    options,
                    checkedId,
                    onchange: (checkedIds) =>
                      onchange(checkedIds.length === 1 ? checkedIds[0] : checkedIds.filter((v) => v !== null)),
                  }),
                ],
                checkAllOptions &&
                  m('.col.s12.option-buttons', [
                    m(Button, {
                      disabled: props.disabled,
                      label: selectAll,
                      iconName: 'check',
                      onclick: () => {
                        state.key = Date.now();
                        onchange(options.map((o) => o.id));
                      },
                    }),
                    unselectAll &&
                      m(Button, {
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
                  ])
              ),
            ];
          }
          case 'select': {
            const checkedId = iv as Array<string | number>;
            // console.log('select ' + id + ': ' + checkedId);
            return m(Select, {
              placeholder: props.multiple ? i18n.pickOneOrMore || 'Pick one or more' : i18n.pickOne || 'Pick one',
              ...props,
              disabled: props.disabled || !options || options.length === 0,
              options,
              checkedId,
              onchange: (checkedIds) =>
                onchange(
                  checkedIds.length === 1 && !props.multiple
                    ? checkedIds[0]
                    : checkedIds.filter((v) => v !== null || typeof v !== 'undefined')
                ),
            });
          }
          case 'map': {
            const overlay = (iv ||
              value || {
                type: 'FeatureCollection',
                features: [],
              }) as FeatureCollection<GeometryObject>;
            const overlays = {} as IObject;
            overlays[id] = geoJSON(overlay);
            // console.log(overlays);
            return m(LeafletMap, {
              baseLayers: {
                osm: {
                  url: 'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
                  options: {
                    subdomains: ['a', 'b'],
                    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
                    maxZoom: 19,
                    maxNativeZoom: 17,
                  },
                },
              },
              className: 'col s12',
              style: 'height: 400px;',
              overlays,
              visible: [id],
              autoFit: true,
              editable: disabled ? undefined : [id],
              showScale: { imperial: false },
              onLayerEdited: (f: FeatureGroup) => {
                onchange(f.toGeoJSON() as any);
                m.redraw();
              },
            });
          }
          case 'md':
            const md = resolvePlaceholders(id ? iv : value || label, obj, context);
            return m(SlimdownView, { md, className: props.className });
          case 'section':
            return m('.divider');
          case 'switch': {
            const checked = iv as boolean;
            const { options: opt } = field;
            const left = opt && opt.length > 0 ? opt[0].label : '';
            const right = opt && opt.length > 1 ? opt[1].label : '';
            return m(Switch, { ...props, left, right, checked, onchange });
          }
          case 'tags': {
            const initialValue = (iv ? (iv instanceof Array ? iv : [iv]) : []) as string[];
            const data = initialValue.map((chip) => ({ tag: chip }));
            const autocompleteOptions =
              options && options.length > 0
                ? {
                    data: options.reduce((acc, cur) => {
                      acc[cur.id] = null;
                      return acc;
                    }, {} as { [key: string]: null }),
                    limit: field.maxLength || Infinity,
                    minLenght: field.minLength || 1,
                  }
                : undefined;
            return m('.input-field col s12', [
              m(Label, { ...props }),
              m(Chips, {
                onchange: (chips: M.ChipData[]) => onchange(chips.map((chip) => chip.tag)),
                placeholder: 'Add a tag',
                secondaryPlaceholder: '+tag',
                data,
                autocompleteOptions,
              }),
            ]);
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
              if (!file || !file.length || file.length < 1) {
                return console.warn('File is undefined');
              }
              const body = new FormData();
              body.append('file', file[0]);
              m.request<string>({
                method: 'POST',
                url,
                body,
              }).then((res) => onchange(res));
            };
            return m(FileInput, {
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
            });
          }
          default:
            return undefined;
        }
      }
    },
  };
};
