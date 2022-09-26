import m, { FactoryComponent, Attributes } from 'mithril';
import { PluginType, UIForm, IInputField, I18n } from 'mithril-ui-form-plugin';
import { Vnode } from 'mithril';
import { formFieldFactory } from './form-field';
import { IRepeatList, RepeatList } from './repeat-list';
import { GeoJSONFeatureList, IGeoJSONFeatureList } from './geojson-feature-list';
import { evalExpression } from '../utils';

export interface ILayoutForm<O extends Record<string, any> = {}> extends Attributes {
  /** The form to display */
  form: UIForm<O>;
  /** The resulting object */
  obj: O;
  /** Relevant context, i.e. the original object and other context from the environment */
  context?: Array<Partial<O> | O[keyof O]>; // TODO Check this type, may be an array of contexts
  /** Callback function, invoked every time the original result object has changed */
  onchange?: (isValid: boolean, obj?: O) => void;
  /** Disable the form, disallowing edits */
  disabled?: boolean | string | string[];
  /** Section ID to display - can be used to split up the form and only show a part */
  section?: string;
  /** Localization options */
  i18n?: I18n;
}

const plugins = {} as { [key: string]: PluginType };
const readonlyPlugins = {} as { [key: string]: PluginType };

/** Register a plugin that converts a particular type to a Mithril component */
export const registerPlugin = (name: string, plugin: PluginType, readonlyPlugin?: PluginType) => {
  plugins[name] = plugin;
  if (readonlyPlugin) readonlyPlugins[name] = readonlyPlugin;
};

const LayoutFormFactory = <O extends Record<string, any> = {}>() => {
  const isValid = (item: O, form: UIForm<O>) => {
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

  const guessType = (field: IInputField<O>) => {
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

  const createLayoutForm = (): FactoryComponent<ILayoutForm<O>> => () => {
    const formField = formFieldFactory(plugins, readonlyPlugins).createFormField();

    const sectionFilter = (section?: string) => {
      if (!section) {
        return (_: IInputField<O>) => true;
      }
      let state = false;
      return ({ type, id }: IInputField<O>): boolean => {
        if (type === 'section') {
          state = id === section;
          return false; // Return false the first time, so we don't output the section too divider
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
              typeof field.repeat === 'undefined'
                ? m(formField as FactoryComponent<any>, {
                    i18n,
                    field,
                    obj,
                    onchange,
                    disabled,
                    readonly,
                    context,
                    section,
                    containerId: 'body',
                  })
                : field.repeat === 'geojson'
                ? m(GeoJSONFeatureList<O>, {
                    obj,
                    field,
                    onchange,
                    context,
                    i18n,
                    containerId: 'body',
                    disabled,
                    readonly,
                  } as IGeoJSONFeatureList<O>)
                : m(RepeatList<O>, {
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

  return {
    createLayoutForm,
    isValid,
  };
};

export const LayoutForm = LayoutFormFactory().createLayoutForm();
