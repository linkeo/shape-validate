import { AnyShape } from '../util/shape.types';
import { Schema } from '../util/schema.types';
import { BaseShapeImpl } from './base';

/**
 * 创建一个「形状」用于描述自定义类型的值，使用自定义的Schema来验证数据
 */
export function custom<T>(schema: Schema): AnyShape<T> {
  return new BaseShapeImpl(schema);
}

/**
 * 创建一个「形状」用于描述布尔值
 *
 * *值会先尝试转整数、再转布尔值*
 */
export function boolean(): AnyShape<boolean> {
  return new BaseShapeImpl({
    allOf: [{ anyOf: [{ type: 'integer' }, {}] }, { type: 'boolean' }],
  });
}

/**
 * 创建一个「形状」用于描述日期时间的值
 *
 * *可以接受 Epoch毫秒数 或者 ISO8601格式的字符串*
 */
export function date(): AnyShape<string | number> {
  return new BaseShapeImpl({
    anyOf: [
      { type: 'integer', minimum: 0 },
      { type: 'string', format: 'date-time' },
    ],
  });
}

/**
 * 创建一个「形状」用于描述任意值
 */
export function any(): AnyShape<unknown> {
  return new BaseShapeImpl({});
}

/**
 * 创建一个「形状」用于描述枚举值
 * @param values 枚举值的可用值列表
 */
export function enumerate<T>(values: T[]): AnyShape<T> {
  return new BaseShapeImpl({ enum: values });
}

/**
 * 创建一个「形状」用于描述固定值
 */
export function constant<T>(value: T): AnyShape<T> {
  return new BaseShapeImpl({ const: value });
}
