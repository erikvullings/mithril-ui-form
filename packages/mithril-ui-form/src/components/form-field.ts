import m, { Component, Attributes } from 'mithril';
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
  Select,
  Options,
  IInputOption,
  Switch,
  Kanban,
  IModelField,
  IConvertibleType,
  uuid4,
  uniqueId,
} from 'mithril-materialized';
import { IInputField } from '../models/input-field';
import { capitalizeFirstLetter, toHourMin } from '../utils/helpers';
import { RepeatList, IRepeatList } from './repeat-list';

const unwrapComponent = <T>(
  key: string,
  {
    label = capitalizeFirstLetter(key),
    description,
    required,
    disabled,
    className,
    icon,
    iconClass,
    placeholder,
  }: IInputField<T>,
  autofocus = false,
  isDisabled = false
) => {
  const result = { label } as { [key: string]: any };
  if (description) { result.description = description; }
  if (className) { result.className = className; }
  if (icon) { result.iconName = icon; }
  if (iconClass) { result.iconClass = iconClass; }
  if (placeholder) { result.placeholder = placeholder; }
  if (required) { result.isMandatory = true; }
  if (disabled || isDisabled) { result.disabled = true; }
  if (autofocus) { result.autofocus = true; }
  return result;
};

export interface IFormField<T> extends Attributes {
  propKey: Extract<keyof T, string>;
  field: IInputField<T>;
  obj: T;
  autofocus?: boolean;
  onchange?: () => void;
  disabled?: boolean;
}

/** A single input field in a form */
export const FormField = <T extends { [K in Extract<keyof T, string>]: unknown }>(): Component<IFormField<T>> => {
  return {
    view: ({ attrs: {  propKey, field, obj, autofocus, onchange: onFormChange, disabled } }) => {
      const { value, description, required, repeat, autogenerate } = field;
      const props = unwrapComponent(propKey, field, autofocus, disabled);

      const validate = required
        ? (v: string | number | Array<string | number>) =>
            v instanceof Array ? v && v.length > 0 : typeof v !== undefined
        : undefined;

      const onchange = (v: string | number | Array<string | number | { [key: string]: any }> | Date | boolean) => {
        obj[propKey] = v as any;
        if (onFormChange) {
          onFormChange();
        }
      };

      const type =
        field.type ||
        (value
          ? typeof value === 'string'
            ? 'text'
            : typeof value === 'number'
            ? 'number'
            : typeof value === 'boolean'
            ? 'checkbox'
            : 'text'
          : 'text');

      if (typeof repeat !== 'undefined') {
        return m(RepeatList, {
          propKey,
          obj,
          field,
          autofocus,
          onchange,
        } as IRepeatList<T>);
      }

      if (autogenerate && !obj[propKey]) {
        debugger;
        obj[propKey] = (autogenerate === 'guid' ? uuid4() : uniqueId()) as any;
      }

      switch (type) {
        case 'color': {
          const initialValue = (obj[propKey] || value) as string;
          return m(ColorInput, { ...props, initialValue, onchange });
        }
        case 'time': {
          const date = ((obj[propKey] || value) as Date) || new Date();
          const initialValue = toHourMin(date);
          obj[propKey] = initialValue as any;
          return m(TimePicker, {
            twelveHour: false,
            initialValue,
            onchange,
          });
        }
        case 'date': {
          const initialValue = ((obj[propKey] || value) as Date) || new Date();
          obj[propKey] = initialValue as any;
          return m(DatePicker, {
            ...props,
            format: 'mmmm d, yyyy',
            initialValue,
            onchange,
          });
        }
        case 'email': {
          const initialValue = (obj[propKey] || value) as string;
          return m(EmailInput, {
            ...props,
            validate,
            autofocus,
            onchange,
            initialValue,
          });
        }
        case 'kanban':
          if (field.model) {
            const items = (obj[propKey] || value) as IConvertibleType[];
            const model = Object.keys(field.model).map(k => {
              const { type: component, ...ct } = field.model[k] as IInputField<T[keyof T]>;
              return {
                id: k,
                placeholder: component === 'select' ? 'Pick one' : undefined,
                ...ct,
                component,
                iconName: ct.icon,
              } as IModelField;
            });
            // console.log(JSON.stringify(model, null, 2));
            return m(Kanban, { ...props, model, items, onchange });
          }
          return m('div', 'ERROR - no model present!');
        case 'number': {
          const initialValue = (obj[propKey] || value) as number;
          return m(NumberInput, {
            ...props,
            validate,
            autofocus,
            onchange,
            initialValue,
          });
        }
        case 'paragraph':
          return m('p', description);
        case 'radio': {
          const checkedId = (obj[propKey] || value) as string | number;
          return m(RadioButtons, { ...props, options: field.options || ([] as IInputOption[]), checkedId, onchange });
        }
        case 'options': {
          const checkedId = (obj[propKey] || value) as Array<string | number>;
          return m(Options, { ...props, options: field.options || ([] as IInputOption[]), checkedId, onchange });
        }
        case 'checkbox': {
          const checked = (obj[propKey] || value) as boolean;
          return m(InputCheckbox, { ...props, checked, onchange });
        }
        case 'select': {
          const checkedId = (obj[propKey] || value) as Array<string | number>;
          return m(Select, {
            placeholder: 'Pick one',
            ...props,
            options: field.options || ([] as IInputOption[]),
            checkedId,
            onchange,
          });
        }
        case 'span':
          return m('span', description);
        case 'switch': {
          const checked = (obj[propKey] || value) as boolean;
          const { options: opt } = field;
          const left = opt && opt.length > 0 ? opt[0].label : '';
          const right = opt && opt.length > 1 ? opt[1].label : '';
          return m(Switch, { ...props, left, right, checked, onchange });
        }
        case 'textarea': {
          const initialValue = (obj[propKey] || value) as string;
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
          const initialValue = (obj[propKey] || value) as string;
          return m(UrlInput, {
            ...props,
            validate,
            autofocus,
            onchange,
            initialValue,
          });
        }
        case 'text': {
          const initialValue = (obj[propKey] || value) as string;
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
