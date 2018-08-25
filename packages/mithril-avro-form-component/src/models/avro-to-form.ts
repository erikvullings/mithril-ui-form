import m from 'mithril';
import {
  AvroType,
  IAvroField,
  isAvroRecordType,
  isAvroArrayType,
  isAvroEnumType,
  isAvroMapType,
  IAvroRecordType,
  IAvroEnumType,
  isAvroOptional,
} from './avro-models';
import { inputText, inputNumber } from '../utils/html';
import { uuid4, camelCaseToString } from '../utils/utils';
export { IAvroRecordType } from './avro-models';

/** Converts an AVRO record type to a TypeScript file */
export const avroToForm = (recordType: IAvroRecordType) => {
  const fields = convertRecord(recordType);
  return m('form', m('div', fields));
};

/** Convert a primitive type from AVRO to TypeScript */
const convertPrimitive = (avroType: string): string => {
  switch (avroType) {
    case 'long':
    case 'int':
    case 'double':
    case 'float':
      return 'number';
    case 'bytes':
      return 'Buffer';
    case 'null':
      return 'null | undefined';
    case 'boolean':
      return 'boolean';
    default:
      return '';
  }
};

/** Convert an AVRO Record type. Return the name, but add the definition to the file */
const convertRecord = (rec: IAvroRecordType) => {
  const typeToInput = (f: IAvroField) => {
    const label = camelCaseToString(f.name);
    switch (f.type) {
      case 'string':
        return inputText({
          id: uuid4(),
          label,
          onchange: (a) => console.log(a),
        });
        case 'int':
        case 'double':
        case 'float':
        case 'long':
        return inputNumber({
          id: uuid4(),
          label,
          onchange: (a) => console.log(a),
        });
    }
  };
  return rec.fields.map(typeToInput);
};

/** Convert an AVRO Enum type. Return the name, but add the definition to the file */
const convertEnum = (enumType: IAvroEnumType, fileBuffer: string[]): string => {
  const enumDef = `export enum ${enumType.name} { ${enumType.symbols.join(', ')} };\n`;
  fileBuffer.push(enumDef);
  return enumType.name;
};

const convertType = (type: AvroType, buffer: string[]): string => {
  // if it's just a name, then use that
  if (typeof type === 'string') {
    return convertPrimitive(type) || type;
  } else if (type instanceof Array) {
    // array means a Union. Use the names and call recursively
    return type.map(t => convertType(t, buffer)).join(' | ');
  } else if (isAvroRecordType(type)) {
    // record, use the name and add to the buffer
    return '';
    // return convertRecord(type, buffer);
  } else if (isAvroArrayType(type)) {
    // array, call recursively for the array element type
    return convertType(type.items, buffer) + '[]';
  } else if (isAvroMapType(type)) {
    // Dictionary of types, string as key
    return `{ [index:string]:${convertType(type.values, buffer)} }`;
  } else if (isAvroEnumType(type)) {
    // array, call recursively for the array element type
    return convertEnum(type, buffer);
  } else {
    console.error('Cannot work out type', type);
    return 'UNKNOWN';
  }
};

const convertIFieldDec = (field: IAvroField, buffer: string[]): string => {
  // Union Type
  return `\t${field.name}${isAvroOptional(field.type) ? '?' : ''}: ${convertType(field.type, buffer)};`;
};
