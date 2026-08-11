import m, { Attributes, Component } from 'mithril';
import { PluginType, UIForm, InputField, FormAttributes } from 'mithril-ui-form-plugin';
import { Vnode } from 'mithril';
import { FormFieldFactory, IFormField } from './form-field';
import { IRepeatList, RepeatList } from './repeat-list';
import { GeoJSONFeatureList, IGeoJSONFeatureList } from './geojson-feature-list';
import { evalExpression } from '../utils';

export type FormComponent<O extends Attributes = {}> = Component<FormAttributes<O>>;

const plugins = {} as { [key: string]: PluginType };
const readonlyPlugins = {} as { [key: string]: PluginType };

/** Register a plugin that converts a particular type to a Mithril component */
export const registerPlugin = (name: string, plugin: PluginType, readonlyPlugin?: PluginType) => {
  plugins[name] = plugin;
  if (readonlyPlugin) readonlyPlugins[name] = readonlyPlugin;
};

/**
 * Recursively determines whether `item` satisfies the `required` fields of `form`,
 * descending into nested object fields (`field.type` is itself a sub-form), repeated
 * items (`field.repeat`), and geojson feature properties (`field.repeat === 'geojson'`)
 * so that a required field nested inside any of those also invalidates the parent form.
 */
export const isValid = <O extends Attributes = {}>(item: O, form: UIForm<O>): boolean => {
  if (!item) return true;
  return form.every((f) => {
    const { id, required, type: fieldType, repeat } = f;
    if (!id) return true;
    const value = item[id] as any;

    if (
      required &&
      (typeof value === 'undefined' ||
        (value instanceof Array && value.length === 0) ||
        (typeof value === 'string' && value.length === 0))
    ) {
      return false;
    }

    if (!(fieldType instanceof Array)) return true;
    const subForm = fieldType as UIForm<any>;

    if (repeat) {
      if (repeat === 'geojson') {
        if (typeof value !== 'string' || !value) return true;
        try {
          const collection = JSON.parse(value) as { features?: Array<{ properties?: any }> };
          return (collection.features || []).every((feature) => isValid(feature.properties || {}, subForm));
        } catch {
          return true;
        }
      }
      return !(value instanceof Array) || value.every((it: any) => isValid(it, subForm));
    }

    return typeof value === 'undefined' || isValid(value, subForm);
  });
};

const guessType = <O extends Attributes = {}>(field: InputField<O>) => {
  const { autogenerate, value, options } = field;
  return autogenerate
    ? 'none'
    : value
    ? typeof value === 'string'
      ? 'md'
      : typeof value === 'number'
      ? 'number'
      : typeof value === 'boolean'
      ? 'checkbox'
      : 'none'
    : options && options.length > 0
    ? 'select'
    : 'none';
};

const FormField: { <O extends Attributes>(): Component<IFormField<O>> } = FormFieldFactory(plugins, readonlyPlugins);

export const LayoutForm = <O extends Record<string, any> = {}>(): FormComponent<O> => {
  // Memoized section filter for performance
  const sectionFilterCache = new Map<string | undefined, (field: InputField<O>) => boolean>();
  
  const getSectionFilter = (section?: string) => {
    if (sectionFilterCache.has(section)) {
      return sectionFilterCache.get(section)!;
    }
    
    const filter = section ? (() => {
      let state = false;
      return ({ type, id }: InputField<O>): boolean => {
        if (type === 'section') {
          state = id === section;
          return false; // Return false the first time, so we don't output the section divider too
        }
        return state;
      };
    })() : (_: InputField<O>) => true;
    
    sectionFilterCache.set(section, filter);
    return filter;
  };

  return {
    view: ({ attrs: { i18n, form, obj, onchange: onChange, disabled, readonly, context, section } }) => {
      const onchange = (res: O) => onChange && onChange(isValid(res, form), res);
      const sectionFilter = getSectionFilter(section);
      const ctx = context || [];

      // Optimized filtering with early returns and single pass
      const visibleFields: Array<Vnode<any, any>> = [];
      
      for (const field of form) {
        // Early return for section filtering
        if (!sectionFilter(field)) continue;
        
        // Early return for conditional visibility
        if (field.show && !evalExpression(field.show, obj, ...ctx.filter((c): c is O[keyof O] | Partial<O> => 
          typeof c === 'object' && c !== null && !('id' in c && 'label' in c)
        ))) continue;
        
        // Guess type if not provided
        if (!field.type) field.type = guessType(field);
        
        const commonProps = {
          i18n,
          field,
          obj,
          onchange,
          disabled,
          readonly,
          context: ctx,
          section,
          containerId: 'body',
        };

        if (typeof field.repeat === 'undefined' || (field.repeat as Boolean) === false) {
          visibleFields.push(m(FormField, commonProps as IFormField<O>));
        } else if (field.repeat === 'geojson') {
          visibleFields.push(m(GeoJSONFeatureList, commonProps as IGeoJSONFeatureList<O>));
        } else {
          visibleFields.push(m(RepeatList, commonProps as IRepeatList<O>));
        }
      }
      
      return visibleFields;
    },
  };
};
