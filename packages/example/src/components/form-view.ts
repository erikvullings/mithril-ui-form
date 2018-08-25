import m from 'mithril';
import { FormContainer, IAvroRecordType } from 'mithril-avro-form-component';
import { DropdownComponent } from './dropdown';
import { avroSchemas } from '../schemas/schemas';

export const FormView = () => {
  const state = {
    schema: undefined as IAvroRecordType | undefined,
  };
  return {
    view: () => {
      // console.log('Drawing the view...');
      return m('.row', [
        m('.col.s6', [
          m('h3', 'Select your schema'),
          m(DropdownComponent, {
            id: 'dropdown',
            items: Object.keys(avroSchemas),
            selected: (key: string) => {
              state.schema = avroSchemas[key] as IAvroRecordType;
              console.log(JSON.stringify(state.schema, null, 2));
            },
          }),
          m('h3', 'Form'),
          m(FormContainer, { schema: state.schema }),
        ]),
      ]);
    },
  };
};
