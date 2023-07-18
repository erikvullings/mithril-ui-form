import m, { Attributes, Component } from 'mithril';
import { PluginType, UIForm, InputField, FormAttributes } from 'mithril-ui-form-plugin';
import { Vnode } from 'mithril';
import { CreateFormField as FormFieldFactory, IFormField } from './form-field';
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

const isValid = <O extends Attributes = {}>(item: O, form: UIForm<O>) => {
  return form
    .filter((f) => f.required && typeof f.id !== undefined)
    .reduce(
      (acc, cur) =>
        acc &&
        !(
          cur.id &&
          (typeof item[cur.id] === 'undefined' ||
            ((item[cur.id] as any) instanceof Array && item[cur.id].length === 0) ||
            (typeof item[cur.id] === 'string' && (item[cur.id] as string).length === 0))
        ),
      true
    );
};

const guessType = <O = {}>(field: InputField<O>) => {
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

export const LayoutForm = <O extends Partial<{}>>(): FormComponent<O> => {
  const sectionFilter = (section?: string) => {
    if (!section) {
      return (_: InputField<O>) => true;
    }
    let state = false;
    return ({ type, id }: InputField<O>): boolean => {
      if (type === 'section') {
        state = id === section;
        return false; // Return false the first time, so we don't output the section divider too
      }
      return state;
    };
  };

  return {
    view: ({ attrs: { i18n, form, obj, onchange: onChange, disabled, readonly, context, section } }) => {
      const onchange = (res: O) => onChange && onChange(isValid(res, form), res);

      return form
        .filter(sectionFilter(section))
        .filter((field) => !field.show || evalExpression(field.show, obj, ...(context || [])))
        .reduce((acc, field) => {
          if (!field.type) field.type = guessType(field);
          return [
            ...acc,
            typeof field.repeat === 'undefined' || (field.repeat as Boolean) === false
              ? m(FormField, {
                  // <O extends m.Attributes>() => m.Component<IGeoJSONFeatureList<O, keyof O>, {}>
                  i18n,
                  field,
                  obj,
                  onchange,
                  disabled,
                  readonly,
                  context,
                  section,
                  containerId: 'body',
                } as IFormField<O>)
              : field.repeat === 'geojson'
              ? m(GeoJSONFeatureList, {
                  obj,
                  field,
                  onchange,
                  context,
                  i18n,
                  containerId: 'body',
                  disabled,
                  readonly,
                } as IGeoJSONFeatureList<O>)
              : m(RepeatList, {
                  obj,
                  field,
                  onchange,
                  context,
                  i18n,
                  containerId: 'body',
                  disabled,
                  readonly,
                } as IRepeatList<O>),
          ];
        }, [] as Array<Vnode<any, any>>);
    },
  };
};
