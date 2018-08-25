/**** Contains the Interfaces and Type Guards for Avro schema */

export type AvroType = AvroNameOrType | AvroNameOrType[];
export type AvroNameOrType = AvroTypeNames | IAvroRecordType | IAvroArrayType | IAvroNamedType;
export type AvroTypeNames = 'record' | 'array' | 'null' | 'map' | string;

export interface IAvroField {
  name: string;
  type: AvroType;
  default?: string | number | null | boolean;
}

export interface IAvroBaseType {
  type: AvroTypeNames;
}

export interface IAvroRecordType extends IAvroBaseType {
  type: 'record';
  name: string;
  fields: IAvroField[];
}

export interface IAvroArrayType extends IAvroBaseType {
  type: 'array';
  items: AvroType;
}

export interface IAvroMapType extends IAvroBaseType {
  type: 'map';
  values: AvroType;
}

export interface IAvroEnumType extends IAvroBaseType {
  type: 'enum';
  name: string;
  symbols: string[];
}

export interface IAvroNamedType extends IAvroBaseType {
  type: string;
}

export const isAvroRecordType = (type: IAvroBaseType): type is IAvroRecordType => type.type === 'record';

export const isAvroArrayType = (type: IAvroBaseType): type is IAvroArrayType => type.type === 'array';

export const isAvroMapType = (type: IAvroBaseType): type is IAvroMapType => type.type === 'map';

export const isAvroEnumType = (type: IAvroBaseType): type is IAvroEnumType => type.type === 'enum';

export const isAvroUnion = (type: AvroType): type is IAvroNamedType[] => type instanceof Array;

export const isAvroOptional = (type: AvroType): boolean => {
  if (isAvroUnion(type)) {
    const t1 = type[0];
    if (typeof t1 === 'string') {
      return t1 === 'null';
    }
  }
  return false;
};
