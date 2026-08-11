import m from 'mithril';
import { DatePicker } from 'mithril-materialized';
import { ReadonlyComponent } from '../readonly';
import { FieldRenderer } from './types';

export const dateReadonly: FieldRenderer = ({ iv, props, i18n }) => {
  const d = iv as Date | number | string | undefined;
  const dto: Intl.DateTimeFormatOptions | undefined = i18n.dateTimeOptions
    ? { ...i18n.dateTimeOptions, hour: undefined, hour12: undefined, minute: undefined, second: undefined }
    : undefined;
  const date = typeof d === 'number' || typeof d === 'string' || d instanceof Date ? new Date(d) : undefined;
  const initialValue = date ? date.toLocaleDateString(i18n.locales, dto) : '';
  return m(ReadonlyComponent, {
    props,
    label: props.label,
    initialValue,
  });
};

export const dateEditable: FieldRenderer = ({ iv, props, obj, id, field, oninput, containerId }) => {
  const { format = 'mmmm d, yyyy' } = props;
  const value: Date = typeof iv === 'number' || typeof iv === 'string' ? new Date(iv) : (iv as Date);
  (obj[id as keyof typeof obj] as any) = value
    ? field.transform
      ? field.transform('to', value.valueOf())
      : value.valueOf()
    : value;
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
    },
    container: containerId as any,
  });
};
