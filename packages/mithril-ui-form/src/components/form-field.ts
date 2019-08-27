import m, { FactoryComponent, Attributes } from 'mithril';
import { LeafletMap } from 'mithril-leaflet';
import { geoJSON } from 'leaflet';
import { Slimdown } from 'slimdown-js';
import { LatLngExpression, FeatureGroup } from 'leaflet';
import {
  InputCheckbox,
  TextInput,
  TextArea,
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
} from 'mithril-materialized';
import { IInputField } from '../models/input-field';
import {
  capitalizeFirstLetter,
  toHourMin,
  evalExpression,
  canResolvePlaceholders,
  resolvePlaceholders,
} from '../utils/helpers';
import { RepeatList, IRepeatList } from './repeat-list';
import { IObject } from '../models/object';
import { SlimdownView } from './slimdown-view';
import { GeometryObject, FeatureCollection } from 'geojson';
import { LayoutForm } from './layout-form';
import { I18n } from '../models/i18n';

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
  } = field;
  const result = { id, label } as IObject;
  if (!label && id) {
    result.label = capitalizeFirstLetter(id);
  }
  if (description) {
    result.helperText = Slimdown.render(description);
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
  /** Translation keys, read once on initialization */
  i18n?: I18n;
}

/** A single input field in a form */
export const FormField: FactoryComponent<IFormField> = () => {
  return {
    view: ({
      attrs: { field, obj, autofocus, onchange: onFormChange, disabled = field.disabled, context, section, i18n },
    }) => {
      const { id = '', type, value, required, repeat, autogenerate, show, label, description } = field;
      if (
        (show && !evalExpression(show, obj, context)) ||
        (label && !canResolvePlaceholders(label, obj, context)) ||
        (description && !canResolvePlaceholders(description, obj, context))
      ) {
        return undefined;
      }

      const options = field.options
        ? field.options
            .filter(o => !o.show || evalExpression(o.show, obj, context))
            .map(o => (o.label ? o : { ...o, label: capitalizeFirstLetter(o.id) }))
        : [];

      const props = unwrapComponent(
        field,
        autofocus,
        typeof disabled === 'boolean' || typeof disabled === 'undefined'
          ? disabled
          : evalExpression(disabled, obj, context)
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
        } as IRepeatList);
      }

      if (obj instanceof Array) {
        return undefined; // Only a repeat list can deal with arrays
      }

      const onchange = (v: string | number | Array<string | number | IObject> | Date | boolean) => {
        if (typeof v === 'undefined' || v === 'undefined') {
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
          return m(LayoutForm, {
            ...props,
            form: type,
            obj: obj[field.id],
            context: [obj, context],
            onchange,
            section,
          });
        }
      }

      if (autogenerate && !obj[id]) {
        obj[id] = (autogenerate === 'guid' ? uuid4() : uniqueId()) as any;
      }

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
            onchange,
          });
        }
        case 'date': {
          const initialValue = ((obj[id] || value) as Date) || new Date();
          obj[id] = initialValue as any;
          return m(DatePicker, {
            ...props,
            format: 'mmmm d, yyyy',
            initialValue,
            onchange,
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
          const initialValue = (obj[id] || value) as number;
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
          return m(RadioButtons, { ...props, options, checkedId, onchange });
        }
        case 'checkbox': {
          const checked = (obj[id] || value) as boolean;
          return m(InputCheckbox, { ...props, checked, onchange });
        }
        case 'options': {
          const checkedId = (obj[id] || value) as Array<string | number>;
          return m(Options, {
            checkboxClass: 'col s6 m4 l3',
            ...props,
            options,
            checkedId,
            onchange: checkedIds =>
              onchange(checkedIds.length === 1 ? checkedIds[0] : checkedIds.filter(v => v !== null)),
          });
        }
        case 'select': {
          const checkedId = (obj[id] || value) as Array<string | number>;
          return m(Select, {
            placeholder: props.multiple ? 'Pick one or more' : 'Pick one',
            ...props,
            options,
            checkedId,
            onchange: checkedIds =>
              onchange(checkedIds.length === 1 ? checkedIds[0] : checkedIds.filter(v => v !== null)),
          });
        }
        case 'map': {
          const bbox = (area: L.GeoJSON) => {
            const result = {
              view: [50, 5] as LatLngExpression,
              zoom: 4,
            };
            if (!area) {
              return result;
            }
            try {
              const bounds = area.getBounds();
              if (Object.keys(bounds).length === 0) {
                return result;
              }
              result.view = bounds.getCenter();
              result.zoom = 10;
            } catch (e) {
              console.warn(e);
            }
            return result;
          };
          const overlay = (obj[id] ||
            value || {
              type: 'FeatureCollection',
              features: [],
            }) as FeatureCollection<GeometryObject>;
          const overlays = {} as IObject;
          const o = geoJSON(overlay);
          overlays[id] = o;
          return m(LeafletMap, {
            ...bbox(o),
            className: 'col s12',
            style: 'height: 400px;',
            overlays,
            visible: [id],
            editable: [id],
            showScale: { imperial: false },
            onLayerEdited: (f: FeatureGroup) => {
              onchange(f.toGeoJSON() as any);
              m.redraw();
            },
          });
        }
        case 'md':
          return m(SlimdownView, { md: (id ? obj[id] : value || label) as string, className: props.className });
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
        case 'time':
          return m('div', 'todo');
        case 'url': {
          const initialValue = (obj[id] || value) as string;
          return m(UrlInput, {
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
    },
  };
};
