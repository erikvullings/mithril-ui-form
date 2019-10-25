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
  /** Section ID to display - can be used to split up the form and only show a part */
  section?: string;
  /** Optional container ID for DatePicker and TimePicker to render their content in */
  containerId?: string;
}

/** A single item that has been repeated. Used for displaying and invoking the edit and delete functionality. */
export const RepeatItem: FactoryComponent<IRepeatItem> = () => {
  return {
    view: ({ attrs: { item, form, ondelete, onedit, disabled, context, section, containerId } }) => {
      return m(`.repeated-item.row`, [
        m(LayoutForm, { disabled, form, obj: item, context, section, containerId }),
        m('.col.s12', [
          m(FlatButton, { iconName: 'delete', onclick: () => ondelete(item) }),
          m(FlatButton, { iconName: 'edit', onclick: () => onedit(item) }),
        ]),
      ]);
    },
  };
};
