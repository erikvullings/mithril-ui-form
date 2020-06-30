import m, { FactoryComponent, Attributes } from 'mithril';
import { Vnode } from 'mithril';
import { FormField } from './form-field';
import { UIForm, IObject, IInputField } from '../models';

export interface ILayoutForm extends Attributes {
  /** The form to display */
  form: UIForm;
  /** The resulting object */
  obj: IObject | IObject[];
  /** Relevant context, i.e. the original object and other context from the environment */
  context?: IObject | IObject[]; // TODO Check this type, may be an array of contexts
  /** Callback function, invoked every time the original result object has changed */
  onchange?: (isValid: boolean, obj?: IObject) => void;
  /** Disable the form, disallowing edits */
  disabled?: boolean | string | string[];
  /** Section ID to display - can be used to split up the form and only show a part */
  section?: string;
}

export const LayoutForm: FactoryComponent<ILayoutForm> = () => {
  const isValid = (item: IObject, form: UIForm) => {
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

  return {
    view: ({ attrs: { form, obj, onchange: onChange, disabled, readonly, context, section } }) => {
      const onchange = () => onChange && onChange(isValid(obj, form), obj);
      const sectionFilter = () => {
        if (!section) {
          return (_: IInputField) => true;
        }
        let state = false;
        return ({ type, id }: IInputField): boolean => {
          if (type === 'section') {
            state = id === section;
          }
          return state;
        };
      };

      return form.filter(sectionFilter()).reduce((acc, field) => {
        const { autogenerate, value, options, type } = field;
        if (!type) {
          field.type = autogenerate
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
        }
        return [
          ...acc,
          m(FormField, { field, obj, onchange, disabled, readonly, context, section, containerId: 'body' }),
        ];
      }, [] as Array<Vnode<any, any>>);
    },
  };
};
