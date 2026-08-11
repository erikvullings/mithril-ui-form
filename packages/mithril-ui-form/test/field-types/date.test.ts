import { InputField } from 'mithril-ui-form-plugin';
import { dateEditable, dateReadonly } from '../../src/components/field-types/date';
import { FieldRenderContext } from '../../src/components/field-types/types';

/**
 * Proof-of-concept for the field-types split (task 0004): each type is now a plain
 * `(ctx) => Vnode` function, so it can be unit-tested directly by constructing a
 * FieldRenderContext and inspecting the returned vnode tree - no Mithril render/mount
 * needed, since m() just builds a vnode object without invoking lifecycle hooks.
 */
describe('field-types/date', () => {
  const baseCtx = (overrides: Partial<FieldRenderContext<any>> = {}): FieldRenderContext<any> => ({
    fieldType: 'date',
    field: { id: 'dob', type: 'date', label: 'Date of birth' },
    obj: {},
    id: 'dob',
    iv: undefined,
    props: { label: 'Date of birth' },
    options: [],
    i18n: {},
    context: [],
    oninput: () => {},
    selectAll: '',
    unselectAll: '',
    state: { key: 0 },
    ...overrides,
  });

  describe('dateEditable', () => {
    it('renders a DatePicker with the resolved value and mutates obj[id] to the epoch value', () => {
      const obj: Record<string, any> = {};
      const iv = new Date('2020-01-15T00:00:00.000Z');
      const vnode = dateEditable(baseCtx({ obj, id: 'dob', iv }));

      expect(vnode.attrs.value).toEqual(iv);
      // Original behavior: obj[id] is written eagerly with the epoch-ms value (or the
      // transform('to', ...) result if a transform is configured), before the picker's own
      // oninput ever fires.
      expect(obj.dob).toBe(iv.valueOf());
    });

    it('applies field.transform("to", ...) to the value written into obj[id]', () => {
      const obj: Record<string, any> = {};
      const iv = new Date('2020-01-15T00:00:00.000Z');
      const transform = ((_dir: 'to' | 'from', v: any) => `wrapped:${v}`) as InputField['transform'];
      dateEditable(baseCtx({ obj, id: 'dob', iv, field: { id: 'dob', type: 'date', transform } }));

      expect(obj.dob).toBe(`wrapped:${iv.valueOf()}`);
    });

    it('computes minDate/maxDate from props.min/props.max relative to the current value', () => {
      const iv = new Date('2020-06-01T00:00:00.000Z');
      const min = new Date('2020-01-01T00:00:00.000Z').valueOf();
      const max = new Date('2020-12-31T00:00:00.000Z').valueOf();
      const vnode = dateEditable(baseCtx({ obj: {}, id: 'dob', iv, props: { min, max } }));

      expect(vnode.attrs.minDate).toEqual(new Date(min));
      expect(vnode.attrs.maxDate).toEqual(new Date(max));
    });

    it('calling oninput with a new date commits it via ctx.oninput as a Date', () => {
      const received: any[] = [];
      const vnode = dateEditable(
        baseCtx({ obj: {}, id: 'dob', iv: new Date('2020-01-01'), oninput: (v: any) => received.push(v) })
      );

      vnode.attrs.oninput('2021-05-05');

      expect(received).toHaveLength(1);
      expect(received[0]).toBeInstanceOf(Date);
      expect(received[0].toISOString().slice(0, 10)).toBe('2021-05-05');
    });
  });

  describe('dateReadonly', () => {
    it('formats a defined date value as a localized date string', () => {
      const iv = new Date('2020-01-15T00:00:00.000Z');
      const vnode = dateReadonly(baseCtx({ iv, i18n: { locales: 'en-US' } }));

      expect(vnode.attrs.initialValue).toBe(iv.toLocaleDateString('en-US'));
      expect(vnode.attrs.initialValue.length).toBeGreaterThan(0);
    });

    it('renders an empty string when iv is not a date-like value', () => {
      const vnode = dateReadonly(baseCtx({ iv: undefined }));

      expect(vnode.attrs.initialValue).toBe('');
    });
  });
});
