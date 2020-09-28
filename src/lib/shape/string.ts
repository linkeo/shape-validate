import { StringSchemaBuiltinFormat, StringSchema } from '../util/schema.types';
import { StringShape, ShapeOptions } from '../util/shape.types';
import { BaseShapeImpl } from './base';

class StringShapeImpl<T> extends BaseShapeImpl<T, 'string'> implements StringShape<T> {
  constructor(schema: StringSchema, options?: ShapeOptions) {
    super(schema, options);
  }

  minLength(length: number): StringShape<T> {
    return this.extend({ minLength: length });
  }

  maxLength(length: number): StringShape<T> {
    return this.extend({ maxLength: length });
  }

  pattern(pattern: RegExp): StringShape<T> {
    const { source, flags } = pattern;
    if (!flags) {
      return this.extend({ pattern: source });
    }
    return this.extend({ regexp: { pattern: source, flags } });
  }

  format(format: StringSchemaBuiltinFormat): StringShape<T> {
    return this.extend({ format });
  }

  trim(): StringShape<T> {
    return this.before({ transform: ['trim'] }, true);
  }

  lowercase(): StringShape<T> {
    return this.before({ transform: ['toLowerCase'] }, true);
  }

  uppercase(): StringShape<T> {
    return this.before({ transform: ['toUpperCase'] }, true);
  }
}

/**
 * 创建一个「形状」用于描述字符串值
 */
export function string(): StringShape<string> {
  return new StringShapeImpl<string>({ type: 'string' });
}
