import { ObjectShape, Shape, ShapeValue, ShapeOptions } from '../util/shape.types';
import { ObjectSchema, Schema } from '../util/schema.types';
import { BaseShapeImpl } from './base';

type ShapeObject = { [key: string]: Shape };

type ExtractShapeProperties<T> = { [K in keyof T]: ShapeValue<T[K]> };

type OptionalKeys<T> = {
  [K in keyof T]: undefined extends T[K] ? K : never;
}[keyof T];

type RequiredKeys<T> = {
  [K in keyof T]: undefined extends T[K] ? never : K;
}[keyof T];

type Flatten<T> = T extends infer U ? { [K in keyof U]: U[K] } : never;

type FixOptional<T> = Flatten<{ [K in RequiredKeys<T>]: T[K] } & { [K in OptionalKeys<T>]?: T[K] }>;

type ObjectShapeValue<T> = FixOptional<ExtractShapeProperties<T>>;

function generateSchemaProperties<T extends ShapeObject>(properties: T): { [key: string]: Schema } {
  return Object.fromEntries(Object.entries(properties).map(([key, shape]) => [key, shape.schema]));
}
function generateSchemaRequired<T extends ShapeObject>(properties: T): string[] {
  return Object.keys(properties).filter((key) => !properties[key].options?.optional);
}

class ObjectShapeImpl<T> extends BaseShapeImpl<T, 'object'> implements ObjectShape<T> {
  constructor(schema: ObjectSchema, options?: ShapeOptions) {
    super(schema, options);
  }

  keepUnknown(keep = true): ObjectShape<T> {
    return this.produce_((draft) => {
      draft.additionalProperties = keep;
    }, undefined);
  }
}

/**
 * 创建一个「形状」用于描述对象，对象的属性可以分别指定不同的「形状」
 *
 * *未指定的属性默认会在验证时去掉*
 */
export function object<T extends ShapeObject>(properties: T): ObjectShape<ObjectShapeValue<T>> {
  return new ObjectShapeImpl({
    type: 'object',
    properties: generateSchemaProperties(properties),
    required: generateSchemaRequired(properties),
    additionalProperties: false,
  });
}

/**
 * 创建一个「形状」用于描述对象，对象的属性来自两个其他的描述对象的「形状」（后者的属性会覆盖前者）
 *
 * *未指定的属性默认会在验证时去掉*
 */
export function merge<T, U>(base: ObjectShape<T>, extra: ObjectShape<U>): ObjectShape<Omit<T, keyof U> & U> {
  return new ObjectShapeImpl({
    type: 'object',
    properties: { ...base.schema.properties, ...extra.schema.properties },
    required: [
      ...(base.schema.required?.filter(
        (key) => !extra.schema.properties || !Reflect.has(extra.schema.properties, key)
      ) ?? []),
      ...(extra.schema.required ?? []),
    ],
    additionalProperties: base.schema.additionalProperties || extra.schema.additionalProperties,
  });
}
