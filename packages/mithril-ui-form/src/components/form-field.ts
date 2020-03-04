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
import { LayoutForm, ReadonlyComponent, RepeatList, IRepeatList, SlimdownView } from '.';

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
    result.helperText = render(description);
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

export interface IFormField extends Attributes {
  /** The input field (or form) that must be rendered repeatedly */
  field: IInputField;
  /** The resulting object */
  obj: IObject | IObject[];
  autofocus?: boolean;
  /** Callback function, invoked every time the original result object has changed */
  onchange?: () => void;
  /** Disable the form, disallowing edits */
  disabled?: boolean | string | string[];
  /** Section ID to display - can be used to split up the form and only show a part */
  section?: string;
  /** Optional container ID for DatePicker and TimePicker to render their content in */
  containerId?: string;
  /** Set to true when the view should return only readonly components */
  readonly?: boolean;
}

/** A single input field in a form */
export const FormField: FactoryComponent<IFormField> = () => {
  const state = { key: Date.now() } as { key: number };

  return {
    view: ({
      attrs: { field, obj, autofocus, onchange: onFormChange, context, containerId, disabled: d, readonly: r },
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
        inline,
        i18n,
        checkAllOptions,
      } = field;
      if (
        (show && !evalExpression(show, obj, context)) ||
        (label && !canResolvePlaceholders(label, obj, context)) ||
        (description && !canResolvePlaceholders(description, obj, context))
      ) {
        // console.table({ show, obj, context });
        return undefined;
      }

      const options = field.options
        ? field.options
            .filter(o => !o.show || evalExpression(o.show, obj, context))
            .map(o => (o.label ? o : { ...o, label: capitalizeFirstLetter(o.id) }))
        : [];

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
          inline,
          containerId,
          disabled,
          readonly,
        } as IRepeatList);
      }

      if (obj instanceof Array) {
        return undefined; // Only a repeat list can deal with arrays
      }

      const onchange = (v: string | number | Array<string | number | IObject> | Date | boolean) => {
        if (typeof v === 'undefined' || v === 'undefined') {
          delete obj[id];
          return;
        }
        obj[id] = v as any;
        if (onFormChange) {
          onFormChange();
        }
      };

      if (type instanceof Array) {
        if (field.id) {
          if (!obj.hasOwnProperty(field.id)) {
            obj[field.id] = {};
          }
          return [
            m('div', { className: field.className }, m.trust(render(field.label || capitalizeFirstLetter(field.id)))),
            m(LayoutForm, {
              ...props,
              readonly,
              form: type,
              obj: obj[field.id],
              context: [obj, context],
              onchange: () => onFormChange && onFormChange(),
              containerId,
            }),
          ];
        }
      }

      if (autogenerate && !obj[id]) {
        obj[id] = (autogenerate === 'guid' ? uuid4() : autogenerate === 'id' ? uniqueId() : Date.now()) as any;
      }

      const [selectAll, unselectAll] = checkAllOptions ? checkAllOptions.split('|') : ['', ''];

      if (readonly && type && ['md', 'map', 'none'].indexOf(type as string) < 0) {
        switch (type) {
          case 'time': {
            const date = ((obj[id] || value) as Date) || new Date();
            const initialValue = toHourMin(date);
            return m(ReadonlyComponent, {
              props,
              label: props.label,
              initialValue,
            });
          }
          case 'date': {
            const iv = (obj[id] || value) as Date | undefined;
            const initialValue =
              typeof iv === 'number' || typeof iv === 'string' || iv instanceof Date
                ? new Date(iv).toLocaleDateString()
                : '';
            return m(ReadonlyComponent, {
              props,
              label: props.label,
              initialValue,
            });
          }
          case 'checkbox': {
            const checked = (obj.hasOwnProperty(id) ? obj[id] : value) as boolean;
            const initialValue = checked ? '✔' : '✘';
            return m(ReadonlyComponent, {
              props,
              label: props.label,
              initialValue,
              inline: true,
            });
          }
          case 'tags': {
            const initialValue = (obj[id] || value || []) as string[];
            return m(ReadonlyComponent, {
              props,
              label: props.label,
              initialValue,
            });
          }
          case 'options':
          case 'select': {
            const checkedIds = (obj[id] || value || []) as Array<string | number>;
            const selected = options.filter(o => checkedIds.indexOf(o.id) >= 0);
            const initialValue =
              selected && selected.length === 0
                ? '?'
                : selected.length === 1
                ? selected[0].label
                : selected.map(o => o.label);
            return m(ReadonlyComponent, {
              props,
              label: props.label,
              initialValue,
            });
          }
          case 'radio': {
            const checkedId = (obj[id] || value) as string | number;
            const selected = options.filter(o => o.id === checkedId);
            const initialValue = selected && selected.length ? selected[0].label : '?';
            return m(ReadonlyComponent, {
              props,
              label: props.label,
              initialValue,
            });
          }
          case 'file': {
            const initialValue = (obj[id] || value) as string | string[];
            const iv = initialValue instanceof Array ? initialValue : [initialValue];
            return m(
              'div',
              props,
              iv.map(f => {
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
            const initialValue = (obj[id] || value) as string;
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
            const initialValue = (obj[id] || value) as string;
            return m(ColorInput, { ...props, initialValue, onchange });
          }
          case 'time': {
            const date = ((obj[id] || value) as Date) || new Date();
            const initialValue = toHourMin(date);
            obj[id] = initialValue as any;
            return m(TimePicker, {
              twelveHour: false,
              initialValue,
              onchange: time => {
                onchange(time);
                m.redraw();
              },
              container: containerId,
            });
          }
          case 'date': {
            const iv = ((obj[id] || value) as Date) || undefined;
            const initialValue = typeof iv === 'number' || typeof iv === 'string' ? new Date(iv) : iv;
            obj[id] = initialValue ? initialValue.valueOf() : initialValue;
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
              onchange: date => {
                onchange(new Date(date).valueOf());
                // m.redraw();
              },
              container: containerId as any,
            });
          }
          case 'email': {
            const initialValue = (obj[id] || value) as string;
            return m(EmailInput, {
              ...props,
              validate,
              autofocus,
              onchange,
              initialValue,
            });
          }
          case 'number': {
            const initialValue = (obj.hasOwnProperty(id) ? obj[id] : value) as number;
            return m(NumberInput, {
              ...props,
              validate,
              autofocus,
              onchange,
              initialValue,
            });
          }
          case 'radio': {
            const checkedId = (obj[id] || value) as string | number;
            return m(RadioButtons, {
              ...props,
              inline,
              options,
              checkedId,
              onchange,
            });
          }
          case 'checkbox': {
            const checked = (obj.hasOwnProperty(id) ? obj[id] : value) as boolean;
            return m(InputCheckbox, { ...props, checked, onchange });
          }
          case 'options': {
            const checkedId = (obj[id] || value) as Array<string | number>;
            return [
              m(
                '.row',
                [
                  m(Options, {
                    key: state.key,
                    checkboxClass: 'col s6 m4 l3',
                    className: 'input-field col s12',
                    ...props,
                    options,
                    checkedId,
                    onchange: checkedIds =>
                      onchange(checkedIds.length === 1 ? checkedIds[0] : checkedIds.filter(v => v !== null)),
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
                        onchange(options.map(o => o.id));
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
            const checkedId = (obj[id] || value) as Array<string | number>;
            return m(Select, {
              placeholder: props.multiple ? 'Pick one or more' : 'Pick one',
              ...props,
              options,
              checkedId,
              onchange: checkedIds =>
                onchange(
                  checkedIds.length === 1
                    ? checkedIds[0]
                    : checkedIds.filter(v => v !== null || typeof v !== 'undefined')
                ),
            });
          }
          case 'map': {
            const overlay = (obj[id] ||
              value || {
                type: 'FeatureCollection',
                features: [],
              }) as FeatureCollection<GeometryObject>;
            const overlays = {} as IObject;
            const o = geoJSON(overlay);
            overlays[id] = o;
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
              editable: disabled ? undefined : [id],
              showScale: { imperial: false },
              onLayerEdited: (f: FeatureGroup) => {
                onchange(f.toGeoJSON() as any);
                m.redraw();
              },
            });
          }
          case 'md':
            const md = resolvePlaceholders(id ? obj[id] : value || label, obj, context);
            return m(SlimdownView, { md, className: props.className });
          case 'section':
            return m('.divider');
          case 'switch': {
            const checked = (obj[id] || value) as boolean;
            const { options: opt } = field;
            const left = opt && opt.length > 0 ? opt[0].label : '';
            const right = opt && opt.length > 1 ? opt[1].label : '';
            return m(Switch, { ...props, left, right, checked, onchange });
          }
          case 'tags': {
            const initialValue = (obj[id] || value || []) as string[];
            const data = initialValue.map(chip => ({ tag: chip }));
            return m('.input-field col s12', [
              m(Label, { ...props }),
              m(Chips, {
                onchange: (chips: M.ChipData[]) => onchange(chips.map(chip => chip.tag)),
                placeholder: 'Add a tag',
                secondaryPlaceholder: '+tag',
                data,
              }),
            ]);
          }
          case 'textarea': {
            const initialValue = (obj[id] || value) as string;
            return m(TextArea, {
              ...props,
              validate,
              autofocus,
              onchange,
              initialValue,
            });
          }
          case 'file': {
            const initialValue = (obj[id] || value) as string;
            const { url, placeholder } = field;
            if (!url) {
              throw Error('Input field "url" not defined, which indicates the URL to the upload folder.');
            }
            const upload = (file: FileList) => {
              if (!file || file.length < 1) {
                return console.warn('File is undefined');
              }
              const body = new FormData();
              body.append('file', file[0]);
              m.request<string>({
                method: 'POST',
                url,
                body,
              }).then(res => onchange(res));
            };
            return m(FileInput, {
              ...props,
              placeholder: initialValue || placeholder,
              onchange: upload,
              initialValue,
            });
          }
          case 'url': {
            const initialValue = (obj[id] || value) as string;
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
            const initialValue = (obj[id] || value) as string;
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
