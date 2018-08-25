/**
 * Definitions for Avro AVSC files.
 */
export type AvroSchemaDefinition = AvroSchema;
/**
 * Root Schema
 */
export type AvroSchema = AvroTypes;
/**
 * Allowed Avro types
 */
export type AvroTypes =
  | PrimitiveType
  | CustomType
  | IAvroRecord
  | IAvroEnum
  | IAvroArray
  | IAvroMap
  | IAvroFixed
  | AvroUnion;
export type NonUnionAvroTypes =
  | PrimitiveType
  | CustomType
  | IAvroRecord
  | IAvroEnum
  | IAvroArray
  | IAvroMap
  | IAvroFixed;
/**
 * Basic type primitives.
 */
export type PrimitiveType = 'null' | 'boolean' | 'int' | 'long' | 'float' | 'double' | 'bytes' | 'string';
/**
 * Reference to a ComplexType
 */
export type CustomType = string;
export type Name = string;
export type Namespace = string;
/**
 * A Union of types
 */
export type AvroUnion = NonUnionAvroTypes[];

/**
 * A AvroRecord
 */
export interface IAvroRecord {
  type: 'AvroRecord';
  name: Name;
  namespace?: Namespace;
  doc?: string;
  aliases?: Name[];
  fields: IAvroField[];
  [k: string]: any;
}
/**
 * A field within a AvroRecord
 */
export interface IAvroField {
  name: Name;
  type: AvroTypes;
  doc?: string;
  default?: any;
  order?: 'ascending' | 'descending' | 'ignore';
  aliases?: Name[];
  [k: string]: any;
}
/**
 * An AvroEnumeration
 */
export interface IAvroEnum {
  type: 'AvroEnum';
  name: Name;
  namespace?: Namespace;
  doc?: string;
  aliases?: Name[];
  symbols: Name[];
  [k: string]: any;
}
/**
 * An AvroArray
 */
export interface IAvroArray {
  type: 'AvroArray';
  name?: Name;
  namespace?: Namespace;
  doc?: string;
  aliases?: Name[];
  items: AvroTypes;
  [k: string]: any;
}
/**
 * A AvroMap of values
 */
export interface IAvroMap {
  type: 'AvroMap';
  name?: Name;
  namespace?: Namespace;
  doc?: string;
  aliases?: Name[];
  values: AvroTypes;
  [k: string]: any;
}
/**
 * A fixed sized AvroArray of bytes
 */
export interface IAvroFixed {
  type: 'fixed';
  name: Name;
  namespace?: Namespace;
  doc?: string;
  aliases?: Name[];
  size: number;
  [k: string]: any;
}
