import { NumberSchema, IntegerSchema } from '../util/schema.types';
import { NumberShape, ShapeOptions } from '../util/shape.types';
import { BaseShapeImpl } from './base';

class NumberShapeImpl<T> extends BaseShapeImpl<T, 'number'> implements NumberShape<T> {
  constructor(schema: NumberSchema | IntegerSchema, options?: ShapeOptions) {
    super(schema, options);
  }

  min(value: number, exclusive?: boolean): NumberShape<T> {
    return this.produce_((draft) => {
      if (exclusive) {
        draft.exclusiveMinimum = value;
        delete draft.minimum;
      } else {
        draft.minimum = value;
        delete draft.exclusiveMinimum;
      }
    }, undefined);
  }

  max(value: number, exclusive?: boolean): NumberShape<T> {
    return this.produce_((draft) => {
      if (exclusive) {
        draft.exclusiveMaximum = value;
        delete draft.maximum;
      } else {
        draft.maximum = value;
        delete draft.exclusiveMaximum;
      }
    }, undefined);
  }

  range(min: number, max: number, exclusive?: boolean): NumberShape<T> {
    return this.produce_((draft) => {
      if (exclusive) {
        draft.exclusiveMaximum = max;
        draft.exclusiveMinimum = min;
        delete draft.minimum;
        delete draft.maximum;
      } else {
        draft.minimum = min;
        draft.maximum = max;
        delete draft.exclusiveMinimum;
        delete draft.exclusiveMaximum;
      }
    }, undefined);
  }

  multipleOf(base: number): NumberShape<T> {
    return this.produce_((draft) => {
      draft.multipleOf = base;
    }, undefined);
  }
}

/**
 * 创建一个「形状」用于描述数字值
 */
export function number(): NumberShape<number> {
  return new NumberShapeImpl<number>({ type: 'number' });
}

/**
 * 创建一个「形状」用于描述整数值
 */
export function integer(): NumberShape<number> {
  return new NumberShapeImpl<number>({ type: 'integer' });
}
