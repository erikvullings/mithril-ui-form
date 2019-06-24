import { Vnode } from 'mithril';
import { FormType, isFormComponent } from '../models/form-component';
import { componentFactory } from './component-factory';

export const formFactory = <T>(form: FormType<T>, result = {} as T, onchange?: () => void): Array<Vnode<any, any>> => {
  return Object.keys(form).reduce((acc, k) => {
    const key = k as Extract<keyof Partial<T>, string>;
    const fc = form[key];
    // const onchange = () => console.log('form changed');
    if (isFormComponent(fc)) {
      return [...acc, componentFactory(key, fc, result, { onchange })];
    } else {
      return [...acc, ...formFactory(fc as FormType<T>, result, onchange)];
    }
  }, [] as Array<Vnode<any, any>>);
};
