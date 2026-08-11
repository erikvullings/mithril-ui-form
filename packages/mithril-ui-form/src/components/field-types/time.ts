import m from 'mithril';
import { TimePicker } from 'mithril-materialized';
import { toHourMin } from '../../utils';
import { ReadonlyComponent } from '../readonly';
import { FieldRenderer } from './types';

export const timeReadonly: FieldRenderer = ({ iv, props, i18n }) => {
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
  const date = typeof d === 'number' || typeof d === 'string' || d instanceof Date ? new Date(d) : undefined;
  const initialValue = date ? date.toLocaleTimeString(i18n.locales, dto) : '';
  return m(ReadonlyComponent, {
    props,
    label: props.label,
    initialValue,
  });
};

export const timeEditable: FieldRenderer = ({ iv, props, obj, id, field, oninput, containerId }) => {
  const { twelveHour = false } = props;
  const date: Date = iv ? (typeof iv === 'number' || typeof iv === 'string' ? new Date(iv) : (iv as Date)) : new Date();
  const value = toHourMin(date);
  (obj[id as keyof typeof obj] as any) = field.transform ? field.transform('to', date) : date;
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
};
