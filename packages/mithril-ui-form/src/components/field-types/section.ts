import m from 'mithril';
import { FieldRenderer } from './types';

/** No dedicated readonly rendering - falls back to the generic default readonly display. */
export const sectionEditable: FieldRenderer = () => m('.divider');
