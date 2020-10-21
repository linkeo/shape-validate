import { StringSchemaBuiltinFormat, StringSchema } from '../util/schema.types';
import { StringShape, ShapeOptions } from '../util/shape.types';
import { BaseShapeImpl } from './base';

class StringShapeImpl<T> extends BaseShapeImpl<T, 'string'> implements StringShape<T> {
  constructor(schema: StringSchema, options?: ShapeOptions) {
    super(schema, options);
  }

  minLength(length: number): StringShape<T> {
    return this.produce_((draft) => {
      draft.minLength = length;
    }, undefined);
  }

  maxLength(length: number): StringShape<T> {
    return this.produce_((draft) => {
      draft.maxLength = length;
    }, undefined);
  }

  pattern(pattern: RegExp): StringShape<T> {
    const { source, flags } = pattern;
    if (!flags) {
      return this.produce_((draft) => {
        draft.pattern = source;
      }, undefined);
    }
    return this.produce_((draft) => {
      draft.regexp = { pattern: source, flags };
    }, undefined);
  }

  format(format: StringSchemaBuiltinFormat): StringShape<T> {
    return this.produce_((draft) => {
      draft.format = format;
    }, undefined);
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
