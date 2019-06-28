import m, { Component, Attributes } from 'mithril';
import { Vnode } from 'mithril';
import { isInputField, IInputField } from '../models/input-field';
import { Form } from '../models/form';
import { FormField } from './form-field';
import { IObject } from '../models/object';

export interface ILayoutForm<T extends IObject, C extends IObject> extends Attributes {
  /** The form to display */
  form: Form<T, C>;
  /** The resulting object */
  obj: T;
  /** Relevant context, i.e. the original object and other context from the environment */
  context: T & C;
  /** Callback function, invoked every time the original result object has changed */
  onchange?: (isValid: boolean) => void;
  /** Disable the form, disallowing edits */
  disabled?: boolean | string | string[];
}

export const LayoutForm = <T extends IObject, C extends IObject>(): Component<ILayoutForm<T, C>> => {
  const isValid = (item: T, form: Form<T, C>) => {
    return Object.keys(form)
      .filter(f =>
        isInputField(form[f] as Form<T, C> | IInputField<T, C> | Form<T, C>[Extract<keyof T, string>] | undefined)
      )
      .map(id => ({ ...(form[id] as IInputField<T, C>), id }))
      .filter(f => f.required)
      .reduce(
        (acc, cur) =>
          acc &&
          !(
            typeof item[cur.id] === 'undefined' ||
            (item[cur.id] instanceof Array && (item[cur.id] as any[]).length === 0) ||
            (typeof item[cur.id] === 'string' && (item[cur.id] as string).length === 0)
          ),
        true
      );
  };

  return {
    view: ({ attrs: { form, obj, onchange: onChange, disabled, context } }) => {
      const onchange = () => onChange && onChange(isValid(obj, form));

      return Object.keys(form).reduce(
        (acc, k) => {
          const propKey = k as Extract<keyof Partial<T>, string>;
          const field = form[propKey];
          if (isInputField(field)) {
            return [...acc, m(FormField, { propKey, field, obj, onchange, disabled })];
          } else {
            return [
              ...acc,
              m(LayoutForm, {
                label: field ? field.label : '',
                form: field as Form<any, C>,
                obj: obj[propKey] as IObject,
                onchange,
                disabled,
                context,
              }),
            ];
          }
        },
        [] as Array<Vnode<any, any>>
      );
    },
  };
};
