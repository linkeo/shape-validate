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
        draft.allOf[1].exclusiveMinimum = value;
        delete draft.allOf[1].minimum;
      } else {
        draft.allOf[1].minimum = value;
        delete draft.allOf[1].exclusiveMinimum;
      }
    }, undefined);
  }

  max(value: number, exclusive?: boolean): NumberShape<T> {
    return this.produce_((draft) => {
      if (exclusive) {
        draft.allOf[1].exclusiveMaximum = value;
        delete draft.allOf[1].maximum;
      } else {
        draft.allOf[1].maximum = value;
        delete draft.allOf[1].exclusiveMaximum;
      }
    }, undefined);
  }

  range(min: number, max: number, exclusive?: boolean): NumberShape<T> {
    return this.produce_((draft) => {
      if (exclusive) {
        draft.allOf[1].exclusiveMaximum = max;
        draft.allOf[1].exclusiveMinimum = min;
        delete draft.allOf[1].minimum;
        delete draft.allOf[1].maximum;
      } else {
        draft.allOf[1].minimum = min;
        draft.allOf[1].maximum = max;
        delete draft.allOf[1].exclusiveMinimum;
        delete draft.allOf[1].exclusiveMaximum;
      }
    }, undefined);
  }

  multipleOf(base: number): NumberShape<T> {
    return this.extend({ multipleOf: base });
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
