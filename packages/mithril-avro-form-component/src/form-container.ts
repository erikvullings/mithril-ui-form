import m, { Component, Vnode } from 'mithril';
import { avroToForm, IAvroRecordType } from './models/avro-to-form';

export let log: (...args: any[]) => void = () => undefined;

export const FormContainer = ({
  attrs,
}: Vnode<{ schema?: IAvroRecordType }>) => {
  const state = {
    schema: undefined as IAvroRecordType | undefined,
  };

  return {
    view: vnode => {
      state.schema = vnode.attrs.schema;
      return m('div', state.schema ? avroToForm(state.schema) : 'Select a schema');
      // return m(attrs.schema ? JSON.stringify(attrs.schema, null, 2) : 'Load a schema');
    },
  } as Component<{ schema?: IAvroRecordType }>;
};
