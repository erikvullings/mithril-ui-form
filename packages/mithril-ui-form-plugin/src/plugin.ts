import { Vnode, Component } from 'mithril';
import { InputField } from './input-field';

/**
 * **Plugin System**
 * @category Plugins
 */

/**
 * Plugin component factory function type for extending form fields with custom components.
 * 
 * This type defines the interface that all form field plugins must implement. A plugin
 * is a factory function that takes a Mithril vnode and returns a Mithril component.
 * This allows the form system to be extended with custom field types while maintaining
 * type safety and consistent APIs.
 * 
 * @template V - The type of the field's value
 * @template F - Additional field properties specific to this plugin
 * @template O - The type of the object being edited by the form
 * 
 * @param vnode - Mithril vnode containing the plugin's attributes
 * @returns A Mithril component that renders the custom field
 * 
 * @example
 * ```typescript
 * // Rating plugin that accepts values 1-5
 * interface RatingField {
 *   maxRating?: number;
 *   allowHalfStars?: boolean;
 *   iconType?: 'star' | 'heart' | 'thumb';
 * }
 * 
 * const ratingPlugin: PluginType<number, RatingField, any> = ({ attrs }) => ({
 *   view: ({ attrs: { iv, field, onchange } }) => {
 *     const currentRating = iv || 0;
 *     const maxRating = field.maxRating || 5;
 *     
 *     return m('.rating-field', [
 *       m('.rating-label', field.label),
 *       m('.rating-stars', 
 *         Array.from({ length: maxRating }, (_, i) =>
 *           m('.star', {
 *             class: i < currentRating ? 'filled' : 'empty',
 *             onclick: () => onchange?.(i + 1)
 *           }, '★')
 *         )
 *       )
 *     ]);
 *   }
 * });
 * 
 * // Register the plugin
 * registerPlugin('rating', ratingPlugin);
 * 
 * // Use in form definition
 * const form = [
 *   {
 *     type: 'rating',
 *     id: 'userRating',
 *     label: 'Rate this item',
 *     maxRating: 5,
 *     allowHalfStars: false
 *   }
 * ];
 * ```
 * 
 * @example
 * ```typescript
 * // Color picker plugin with custom properties
 * interface ColorPickerField {
 *   palette?: string[];
 *   allowCustomColors?: boolean;
 *   format?: 'hex' | 'rgb' | 'hsl';
 * }
 * 
 * const colorPickerPlugin: PluginType<string, ColorPickerField> = ({ attrs }) => ({
 *   view: ({ attrs: { iv, field, onchange } }) => {
 *     const currentColor = iv || '#000000';
 *     const palette = field.palette || ['#FF0000', '#00FF00', '#0000FF'];
 *     
 *     return m('.color-picker', [
 *       m('label', field.label),
 *       m('.color-palette',
 *         palette.map(color =>
 *           m('.color-swatch', {
 *             style: { backgroundColor: color },
 *             class: currentColor === color ? 'selected' : '',
 *             onclick: () => onchange?.(color)
 *           })
 *         )
 *       ),
 *       field.allowCustomColors && m('input[type=color]', {
 *         value: currentColor,
 *         oninput: (e: Event) => onchange?.((e.target as HTMLInputElement).value)
 *       })
 *     ]);
 *   }
 * });
 * ```
 */
export type PluginType<V = any, F = any, O = any> = (
  vnode: Vnode<{
    /** 
     * Initial value of the field, typically the current value from the form object.
     * The type V should match the expected value type for this field.
     */
    iv?: V;
    
    /** 
     * Original field properties from the form definition.
     * Combines base InputField properties with plugin-specific properties of type F.
     */
    field: InputField & F;
    
    /** 
     * Processed field properties after placeholder resolution and transformations.
     * Contains the final properties to use for rendering, with resolved labels,
     * descriptions, and other dynamic content.
     */
    props: InputField;
    
    /** 
     * Resolved label text for the field.
     * This is the final label text after processing placeholders and localization.
     */
    label?: string;
    
    /** 
     * Callback function to update the field value.
     * Only present when the component is not in readonly mode.
     * Should be called whenever the field value changes.
     * 
     * @param value - The new value to set for this field
     */
    onchange?: (value: V) => Promise<void>;
    
    /** 
     * The currently active object being edited.
     * This could be the main form object or an item in an array for repeated fields.
     */
    obj: O;
    
    /** 
     * Additional contextual data available to the field.
     * Useful for conditional logic, validation, or accessing parent/sibling data.
     */
    context?: O;
  }>
) => Component<{
  /** Initial value of the field */
  iv?: V;
  
  /** Original field properties from the form definition */
  field: InputField & F;
  
  /** Processed field properties after transformations */
  props: InputField;
  
  /** Resolved label text for the field */
  label?: string;
  
  /** Callback function to update the field value */
  onchange?: (value: V) => Promise<void>;
  
  /** The currently active object being edited */
  obj: O;
  
  /** Additional contextual data available to the field */
  context?: O;
}>;
