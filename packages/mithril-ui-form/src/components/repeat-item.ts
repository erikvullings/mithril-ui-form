import m, { FactoryComponent, Attributes } from 'mithril';
import { FlatButton } from 'mithril-materialized';
import { Form } from '..';
import { LayoutForm } from './layout-form';

export interface IRepeatItem extends Attributes {
  item: any;
  form: Form<any>;
  ondelete: (item: any) => void;
  onedit: (item: any) => void;
}

/** A single item that has been repeated. Used for displaying and invoking the edit and delete functionality. */
export const RepeatItem: FactoryComponent<IRepeatItem> = () => {
  return {
    view: ({ attrs: { item, form, ondelete, onedit }}) => {
      return m('.repeated-item', [
        // formFactory(form, item),
        m(LayoutForm, { form, result: item }),
        m('.row', [
          m(FlatButton, { iconName: 'delete_forever', onclick: () => ondelete(item) }),
          m(FlatButton, { iconName: 'edit', onclick: () => onedit(item) }),
        ]),
      ]);
    },
  };
};
