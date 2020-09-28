import { ArrayShape, Shape, ShapeValue, ShapeOptions, TupleShape } from '../util/shape.types';
import { ArraySchema } from '../util/schema.types';
import { simplifyThreePhaseSchema } from '../util/functions';
import { BaseShapeImpl } from './base';

type TupleShapeValue<ST> = {
  [P in keyof ST]: ShapeValue<ST[P]>;
};

class ArrayShapeImpl<T> extends BaseShapeImpl<T, 'array'> implements ArrayShape<T> {
  constructor(schema: ArraySchema, options?: ShapeOptions) {
    super(schema, options);
  }

  minSize(size: number): ArrayShape<T> {
    return this.extend({ minItems: size });
  }

  maxSize(size: number): ArrayShape<T> {
    return this.extend({ maxItems: size });
  }

  unique(unique = true): ArrayShape<T> {
    return this.extend({ uniqueItems: unique });
  }
}

class TupleShapeImpl<T> extends BaseShapeImpl<T, 'tuple'> implements TupleShape<T> {
  constructor(schema: ArraySchema, options?: ShapeOptions) {
    super(schema, options);
  }
}

/**
 * 创建一个「形状」用于描述数组，数组的元素可以是另一个「形状」的值
 * @param itemShape 描述数组元素的「形状」
 */
export function array<T>(itemShape: Shape<T>): ArrayShape<T[]> {
  return new ArrayShapeImpl({ type: 'array', items: simplifyThreePhaseSchema(itemShape.schema) });
}

/**
 * 创建一个「形状」用于描述元组，元组的每个位置的「形状」按照参数顺序定义
 * @param itemShapes 元组每个元素的「形状」，按照元组元素的顺序和个数定义即可
 */
export function tuple<T extends Shape[]>(...itemShapes: T): TupleShape<TupleShapeValue<T>> {
  return new TupleShapeImpl({
    type: 'array',
    items: itemShapes.map((item) => simplifyThreePhaseSchema(item.schema)),
    minLength: itemShapes.length,
    maxLength: itemShapes.length,
    additionalItems: false,
  });
}
