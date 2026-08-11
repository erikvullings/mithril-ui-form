import m from 'mithril';
import { resolvePlaceholders } from '../../utils';
import { SlimdownView } from '../slimdown-view';
import { FieldRenderer } from './types';

/**
 * No readonly renderer: the outer `readonly` guard in FormFieldFactory excludes 'md' from
 * ever reaching the readonly dispatch (markdown is already static display content), so this
 * editable renderer is used regardless of the `readonly` flag - preserving that pre-existing
 * behavior rather than adding a now-truly-unreachable readonly variant.
 */
export const markdownEditable: FieldRenderer = ({ iv, props, field, obj, id, context }) => {
  const { label, className = 'col s12' } = props;
  const md = resolvePlaceholders((id ? iv : field.value || label) || '', obj, ...context);
  return m(SlimdownView, { md, className });
};
