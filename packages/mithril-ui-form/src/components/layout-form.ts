import m, { Component, Attributes } from 'mithril';
import { Vnode } from 'mithril';
import { isInputField, IInputField } from '../models/input-field';
import { Form } from '../models/form';
import { FormField } from './form-field';

export interface ILayoutForm<T extends { [x: string]: any }> extends Attributes {
  form: Form<T>;
  result: T;
  onchange?: (isValid: boolean) => void;
  disabled?: boolean;
}

export const LayoutForm = <T extends { [x: string]: any }>(): Component<ILayoutForm<T>> => {
  const isValid = (item: T, form: Form<T>) => {
    return Object.keys(form)
      .filter(f => isInputField(form[f] as Form<T> | IInputField<T> | Form<T>[Extract<keyof T, string>] | undefined))
      .map(id => ({ ...(form[id] as IInputField<T>), id }))
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
    view: ({ attrs: { form, result, onchange: onChange, disabled } }) => {
      const onchange = () => onChange && onChange(isValid(result, form));

      return Object.keys(form).reduce(
        (acc, k) => {
          const propKey = k as Extract<keyof Partial<T>, string>;
          const field = form[propKey];
          if (isInputField(field)) {
            return [...acc, m(FormField, { propKey, field, obj: result, onchange, disabled })];
          } else {
            return [
              ...acc,
              m(LayoutForm, {
                form: field as Form<any>,
                result: result[propKey] as { [key: string]: unknown },
                onchange,
                disabled,
              }),
            ];
          }
        },
        [] as Array<Vnode<any, any>>
      );
    },
  };
};
