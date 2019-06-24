import m from 'mithril';
import { TextInput, TextArea, UrlInput, NumberInput, DatePicker, TimePicker, EmailInput } from 'mithril-materialized';
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
) => ({ label, description, placeholder, isMandatory: required, disabled, className, icon, iconClass, autofocus });

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

  const onchange = (v: string | number | Array<string | number> | Date | boolean) => {
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
    case 'color':
      return m('div', 'todo');
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
      return m('div', 'todo');
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
      return m('div', description);
    case 'radio':
      return m('div', 'todo');
    case 'select':
      return m('div', 'todo');
    case 'span':
      return m('div', 'todo');
    case 'switch':
      return m('div', 'todo');
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
