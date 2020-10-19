interface TypeSchemaKeywords {
  type?: 'object' | 'array' | 'number' | 'integer' | 'string' | 'boolean';
  nullable?: boolean;
}

interface AnnotationSchemaKeywords {
  title?: string;
  description?: string;
  default?: unknown;
  example?: unknown;
  examples?: { [key: string]: { value: unknown; summary?: string } };
  readOnly?: boolean;
  writeOnly?: boolean;
  contentEncoding?: string;
  contentMediaType?: string;
}

export type SyncValidationFunction<T = never> = (value: T) => T | void;
export type AsyncValidationFunction<T = never> = (value: T) => Promise<T | void>;

interface CustomExtendKeywords {
  regexp?: string | { pattern: string; flags?: string };
  errorMessage?: string | Record<string, string>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customSync?: SyncValidationFunction<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customAsync?: AsyncValidationFunction<any>;
  stripNull?: boolean;
}

interface CompondSchemaKeywords {
  not?: Schema;
  anyOf?: Schema[];
  oneOf?: Schema[];
  allOf?: Schema[];
  if?: Schema;
  then?: Schema;
  else?: Schema;
}

export interface ObjectSchemaKeywords extends AnnotationSchemaKeywords, CompondSchemaKeywords {
  properties?: { [key: string]: Schema };
  patternProperties?: { [key: string]: Schema };
  additionalProperties?: boolean | Schema;
  maxProperties?: number;
  minProperties?: number;
  required?: readonly string[];
  dependencies?: { [key: string]: string[] | Schema };
  propertyNames?: Schema;
}

export interface ArraySchemaKeywords extends AnnotationSchemaKeywords, CompondSchemaKeywords {
  items?: Schema | readonly Schema[];
  maxItems?: number;
  minItems?: number;
  uniqueItems?: boolean;
  additionalItems?: boolean | Schema;
  contains?: Schema;
}

export interface NumberSchemaKeywords extends AnnotationSchemaKeywords, CompondSchemaKeywords {
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  multipleOf?: number;
}

export type StringSchemaBuiltinFormat = 'date' | 'date-time' | 'uri' | 'email' | 'hostname' | 'ipv4' | 'ipv6' | 'regex';
export interface StringSchemaKeywords extends AnnotationSchemaKeywords, CompondSchemaKeywords {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: StringSchemaBuiltinFormat;
}

export interface LiteralSchemaKeywords extends AnnotationSchemaKeywords, CompondSchemaKeywords {
  enum?: readonly unknown[];
  const?: unknown;
}

interface BaseSchema
  extends TypeSchemaKeywords,
    AnnotationSchemaKeywords,
    ObjectSchemaKeywords,
    ArraySchemaKeywords,
    NumberSchemaKeywords,
    StringSchemaKeywords,
    LiteralSchemaKeywords,
    CompondSchemaKeywords,
    CustomExtendKeywords {}

type BaseSchemaKeys = keyof BaseSchema;

export interface Schema extends BaseSchema, Omit<Record<string, unknown>, BaseSchemaKeys> {}

export type ThreePhraseSchema<T extends Schema = Schema> = {
  allOf: [Schema, T, Schema];
  default?: Schema['default'];
  stripNull?: Schema['stripNull'];
};

export interface ObjectSchema extends Schema {
  type: 'object';
}
export interface ArraySchema extends Schema {
  type: 'array';
}
export interface NumberSchema extends Schema {
  type: 'number';
}
export interface IntegerSchema extends Schema {
  type: 'integer';
}
export interface StringSchema extends Schema {
  type: 'string';
}
export interface BooleanSchema extends Schema {
  type: 'boolean';
}
export interface EnumSchema extends Schema {
  enum: Exclude<Schema['enum'], undefined>;
}
export interface ConstSchema extends Schema {
  const: Exclude<Schema['const'], undefined>;
}
export interface NotSchema extends Schema {
  not: Exclude<Schema['not'], undefined>;
}
export interface AnyOfSchema extends Schema {
  anyOf: Exclude<Schema['anyOf'], undefined>;
}
export interface OneOfSchema extends Schema {
  oneOf: Exclude<Schema['oneOf'], undefined>;
}
export interface AllOfSchema extends Schema {
  allOf: Exclude<Schema['allOf'], undefined>;
}
export interface IfThenElseSchema extends Schema {
  if: Exclude<Schema['if'], undefined>;
  then: Exclude<Schema['then'], undefined>;
  else: Exclude<Schema['else'], undefined>;
}
export interface IfThenSchema extends Schema {
  if: Exclude<Schema['if'], undefined>;
  then: Exclude<Schema['then'], undefined>;
}
export interface IfElseSchema extends Schema {
  if: Exclude<Schema['if'], undefined>;
  else: Exclude<Schema['else'], undefined>;
}
