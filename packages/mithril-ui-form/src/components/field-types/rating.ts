import m from 'mithril';
import { Rating } from 'mithril-materialized';
import { FieldRenderer } from './types';

/** No dedicated readonly rendering - falls back to the generic default readonly display. */
export const ratingEditable: FieldRenderer = ({ iv, props, field, oninput }) => {
  const value = typeof iv === 'string' ? parseInt(iv) : typeof iv === 'number' ? iv : undefined;
  return m('.col.s12', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } }, [
    m('.label', field.label),
    m(Rating, { ...props, value, onchange: oninput }),
  ]);
};
