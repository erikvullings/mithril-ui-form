import m from 'mithril';
import {
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
} from 'mithril-materialized';
import { IFormComponent } from '../models/form-component';
import { capitalizeFirstLetter, toHourMin } from './helpers';

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
  }: IFormComponent<T>,
  autofocus = false
) => ({
  label,
  description,
  placeholder,
  isMandatory: required,
  disabled,
  className,
  iconName: icon,
  iconClass,
  autofocus,
});

export const componentFactory = <T extends { [K in Extract<keyof T, string>]: unknown }>(
  key: Extract<keyof T, string>,
  comp: IFormComponent<T>,
  obj: T,
  options: {
    autofocus?: boolean;
    onchange?: () => void;
  } = {}
) => {
  const { value, description, required } = comp;
  const { autofocus, onchange: onFormChange } = options;
  const props = unwrapComponent(key, comp);

  const validate = required
    ? (v: string | number | Array<string | number>) => (v instanceof Array ? v && v.length > 0 : typeof v !== undefined)
    : undefined;

  const onchange = (v: string | number | Array<string | number | { [key: string]: any }> | Date | boolean) => {
    obj[key] = v as any;
    if (onFormChange) {
      onFormChange();
    }
  };

  const type =
    comp.type ||
    (value
      ? typeof value === 'string'
        ? 'text'
        : typeof value === 'number'
        ? 'number'
        : typeof value === 'boolean'
        ? 'switch'
        : 'text'
      : 'text');
  switch (type) {
    case 'color': {
      const initialValue = (obj[key] || value) as string;
      return m(ColorInput, { ...props, initialValue, onchange });
    }
    case 'time': {
      const date = ((obj[key] || value) as Date) || new Date();
      const initialValue = toHourMin(date);
      return m(TimePicker, {
        twelveHour: false,
        initialValue,
        onchange,
        onClose: () => m.redraw(),
      });
    }
    case 'date': {
      const initialValue = ((obj[key] || value) as Date) || new Date();
      return m(DatePicker, {
        ...props,
        format: 'mmmm d, yyyy',
        initialValue,
        onchange,
        onClose: () => m.redraw(),
      });
    }
    case 'email': {
      const initialValue = (obj[key] || value) as string;
      return m(EmailInput, {
        ...props,
        validate,
        autofocus,
        onchange,
        initialValue,
      });
    }
    case 'kanban':
      if (comp.model) {
        const items = (obj[key] || value) as IConvertibleType[];
        const model = Object.keys(comp.model).map(k => {
          const ct = comp.model[k] as IFormComponent<T[keyof T]>;
          return { id: k, ...ct, iconName: ct.icon } as IModelField;
        });
        return m(Kanban, { ...props, model, items, onchange });
      }
      return m('div', 'ERROR - no model present!');
    case 'number': {
      const initialValue = (obj[key] || value) as number;
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
      const checkedId = (obj[key] || value) as string | number;
      return m(RadioButtons, { ...props, options: comp.options || [] as IInputOption[], checkedId, onchange });
    }
    case 'options': {
      const checkedId = (obj[key] || value) as Array<string | number>;
      return m(Options, { ...props, options: comp.options || [] as IInputOption[], checkedId, onchange });
    }
    case 'select': {
      const checkedId = (obj[key] || value) as Array<string | number>;
      return m(Select, { ...props, options: comp.options || [] as IInputOption[], checkedId, onchange });
    }
    case 'span':
      return m('span', description);
    case 'switch': {
      const checked = (obj[key] || value) as boolean;
      const { options: opt } = comp;
      const left = opt && opt.length > 0 ? opt[0].label : '';
      const right = opt && opt.length > 1 ? opt[1].label : '';
      return m(Switch, { ...props, left, right, checked, onchange });
    }
    case 'textarea': {
      const initialValue = (obj[key] || value) as string;
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
      const initialValue = (obj[key] || value) as string;
      return m(UrlInput, {
        ...props,
        validate,
        autofocus,
        onchange,
        initialValue,
      });
    }
    case 'text':
    default: {
      const initialValue = (obj[key] || value) as string;
      return m(TextInput, {
        ...props,
        validate,
        autofocus,
        onchange,
        initialValue,
      });
    }
  }
};
