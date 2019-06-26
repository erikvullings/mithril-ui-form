import m, { Component, Attributes } from 'mithril';
import { Vnode } from 'mithril';
import { isInputField } from '../models/input-field';
import { Form } from '../models/form';
import { FormField } from './form-field';

export interface ILayoutForm<T> extends Attributes {
  form: Form<T>;
  result: T;
  onchange?: () => void;
}

export const LayoutForm = <T extends { [x: string]: unknown }>(): Component<ILayoutForm<T>> => {
  return {
    view: ({ attrs: { form, result, onchange } }) => {
      return Object.keys(form).reduce(
        (acc, k) => {
          const propKey = k as Extract<keyof Partial<T>, string>;
          const field = form[propKey];
          if (isInputField(field)) {
            return [...acc, m(FormField, { propKey, field, obj: result, onchange })];
          } else {
            return [
              ...acc,
              m(LayoutForm, {
                form: field as Form<any>,
                result: result[propKey] as { [key: string]: unknown },
                onchange,
              }),
            ];
          }
        },
        [] as Array<Vnode<any, any>>
      );
    },
  };
};
