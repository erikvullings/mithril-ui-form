import m, { FactoryComponent, Attributes } from 'mithril';
import { PluginType, UIForm, IInputField, I18n } from 'mithril-ui-form-plugin';
import { Vnode } from 'mithril';
import { formFieldFactory } from './form-field';
import { IRepeatList, RepeatList } from './repeat-list';

export interface ILayoutForm extends Attributes {
  /** The form to display */
  form: UIForm;
  /** The resulting object */
  obj: Record<string, any> | Record<string, any>[];
  /** Relevant context, i.e. the original object and other context from the environment */
  context?: Record<string, any> | Record<string, any>[]; // TODO Check this type, may be an array of contexts
  /** Callback function, invoked every time the original result object has changed */
  onchange?: (isValid: boolean, obj?: Record<string, any>) => void;
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

const LayoutFormFactory = () => {
  const isValid = (item: Record<string, any>, form: UIForm) => {
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

  const guessType = (field: IInputField) => {
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

  const createLayoutForm = (): FactoryComponent<ILayoutForm> => () => {
    const formField = formFieldFactory(plugins, readonlyPlugins).createFormField();

    const sectionFilter = (section?: string) => {
      if (!section) {
        return (_: IInputField) => true;
      }
      let state = false;
      return ({ type, id }: IInputField): boolean => {
        if (type === 'section') {
          state = id === section;
          return false; // Return false the first time, so we don't output the section too divider
        }
        return state;
      };
    };

    return {
      view: ({ attrs: { i18n, form, obj, onchange: onChange, disabled, readonly, context, section } }) => {
        const onchange = (res: Record<string, any>) => onChange && onChange(isValid(res, form), res);

        return form.filter(sectionFilter(section)).reduce((acc, field) => {
          if (!field.type) field.type = guessType(field);
          return [
            ...acc,
            typeof field.repeat === 'undefined'
              ? m(formField, { i18n, field, obj, onchange, disabled, readonly, context, section, containerId: 'body' })
              : m(RepeatList, {
                  obj,
                  field,
                  onchange,
                  context,
                  i18n,
                  containerId: 'body',
                  disabled,
                  readonly,
                } as IRepeatList),
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
