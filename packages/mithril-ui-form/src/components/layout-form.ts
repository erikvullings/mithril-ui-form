import m, { FactoryComponent, Attributes } from 'mithril';
import { Vnode } from 'mithril';
import { FormField } from './form-field';
import { Form, IObject } from '../models';

export interface ILayoutForm extends Attributes {
  /** The form to display */
  form: Form;
  /** The resulting object */
  obj: IObject;
  /** Relevant context, i.e. the original object and other context from the environment */
  context: IObject | IObject[]; // TODO Check this type, may be an array of contexts
  /** Callback function, invoked every time the original result object has changed */
  onchange?: (isValid: boolean) => void;
  /** Disable the form, disallowing edits */
  disabled?: boolean | string | string[];
}

export const LayoutForm: FactoryComponent<ILayoutForm> = () => {
  const isValid = (item: IObject, form: Form) => {
    return (
      form
        .filter(f => f.required)
        .reduce(
          (acc, cur) =>
            acc &&
            !(
              typeof item[cur.id] === 'undefined' ||
              ((item[cur.id] as any) instanceof Array && item[cur.id].length === 0) ||
              (typeof item[cur.id] === 'string' && (item[cur.id] as string).length === 0)
            ),
          true
        )
    );
  };

  return {
    view: ({ attrs: { form, obj, onchange: onChange, disabled, context } }) => {
      const onchange = () => onChange && onChange(isValid(obj, form));

      return form.reduce(
        (acc, field) => {
          const type = field.type;
          if (typeof type === 'undefined') {
            return acc;
          } else {
            return [...acc, m(FormField, { field, obj, onchange, disabled, context })];
          }
        },
        [] as Array<Vnode<any, any>>
      );
    },
  };
};
