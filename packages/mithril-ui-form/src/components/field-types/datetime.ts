import m from 'mithril';
import { DatePicker, TimePicker, NumberInput } from 'mithril-materialized';
import { toHourMin } from '../../utils';
import { ReadonlyComponent } from '../readonly';
import { FieldRenderer } from './types';

export const datetimeReadonly: FieldRenderer = ({ iv, props, i18n }) => {
  const d = iv as Date | number | string | undefined;
  const dto: Intl.DateTimeFormatOptions | undefined = i18n.dateTimeOptions
    ? { hour: '2-digit', minute: '2-digit', month: 'numeric', day: 'numeric', ...i18n.dateTimeOptions }
    : undefined;
  const date = typeof d === 'number' || typeof d === 'string' || d instanceof Date ? new Date(d) : undefined;
  const initialValue = date ? date.toLocaleTimeString(i18n.locales, dto) : '';
  return m(ReadonlyComponent, {
    props,
    label: props.label,
    initialValue,
  });
};

export const datetimeEditable: FieldRenderer = ({ iv, props, oninput, containerId }) => {
  const {
    label,
    className = 'col s12',
    dateTimeSeconds = false,
    twelveHour = false,
    format = 'mmmm d, yyyy',
    ...params
  } = props;
  const initialDateTime: Date = typeof iv === 'number' || typeof iv === 'string' ? new Date(iv) : (iv as Date);
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
    oninput(outputFormat === 'UTC' ? d.toUTCString() : outputFormat === 'ISO' ? d.toISOString() : d.valueOf());
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
};
