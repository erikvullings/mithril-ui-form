import m, { FactoryComponent, Attributes } from 'mithril';
import { FlatButton } from 'mithril-materialized';
import { Form } from '..';
import { LayoutForm } from './layout-form';
import { IObject } from '../models/object';

export interface IRepeatItem extends Attributes {
  item: any;
  form: Form;
  ondelete: (item: any) => void;
  onedit: (item: any) => void;
  context: IObject;
}

/** A single item that has been repeated. Used for displaying and invoking the edit and delete functionality. */
export const RepeatItem: FactoryComponent<IRepeatItem> = () => {
  return {
    view: ({ attrs: { item, form, ondelete, onedit, disabled, context }}) => {
      return m('.repeated-item', [
        // formFactory(form, item),
        m(LayoutForm, { disabled, form, obj: item, context }),
        m('.row', [
          m(FlatButton, { iconName: 'delete_forever', onclick: () => ondelete(item) }),
          m(FlatButton, { iconName: 'edit', onclick: () => onedit(item) }),
        ]),
      ]);
    },
  };
};
