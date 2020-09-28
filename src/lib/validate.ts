import Ajv from 'ajv';
import AjvKeywords from 'ajv-keywords';
import cloneDeep from 'clone-deep';
import { Shape } from './util/shape.types';
import { Schema } from './util/schema.types';
import { ValidationError } from './errors';
import { noop, checkAsyncSchema, simplifyThreePhaseSchema } from './util/functions';
import CustomKeywords from './util/ajv-custom-keyword';

const compiler = new Ajv({
  transpile: false as never,
  coerceTypes: true,
  removeAdditional: 'failing',
  useDefaults: true,
  strictNumbers: true,
  nullable: true,
  verbose: true,
  messages: false,
});

AjvKeywords(compiler, ['transform', 'regexp']);
CustomKeywords(compiler);

const cached = new WeakMap<Shape, Ajv.ValidateFunction>();

function wrap(shape: Shape): Schema {
  const schema = simplifyThreePhaseSchema(shape.schema);
  return {
    $async: checkAsyncSchema(schema),
    type: 'object',
    properties: { value: schema },
    required: shape.options?.optional ? [] : ['value'],
    errorMessage: {
      required: 'is required',
    },
  };
}

function compile(shape: Shape): Ajv.ValidateFunction {
  if (!cached.has(shape)) {
    cached.set(shape, compiler.compile(wrap(shape)));
  }
  const compiled = cached.get(shape);
  if (!compiled) {
    throw new Error('Cannot get compiled validate function');
  }
  return compiled;
}

/**
 * 同步验证数据是否符合「形状」
 * - 验证通过时，返回验证后的数据
 * - 验证不通过时，抛出 ValidationError 的实例
 * - 不支持异步验证
 * @param shape 要验证的「形状」
 * @param value 要验证的数据
 * @param clone 是否在验证前深拷贝数据（默认开启）
 */
export function validateSync<T>(shape: Shape<T>, value: unknown, clone = true): T {
  const validator = compile(shape);
  if (validator.$async) {
    throw new Error('Async validation is not supported, should use validateAsync instead');
  }
  const wrapped = { value };
  if (clone) {
    wrapped.value = cloneDeep(wrapped.value, true);
  }
  const valid = validator(wrapped);
  if (!valid) {
    throw new ValidationError(validator.errors);
  }
  return wrapped.value as never;
}

/**
 * 异步验证数据是否符合「形状」
 * - 验证通过时，Promise 返回验证后的数据
 * - 验证不通过时，Promise 抛出 ValidationError 的实例
 * - 支持异步验证
 * @param shape 要验证的「形状」
 * @param value 要验证的数据
 * @param clone 是否在验证前深拷贝数据（默认开启）
 */
export async function validateAsync<T>(shape: Shape<T>, value: unknown, clone = true): Promise<T> {
  const validator = compile(shape);
  const wrapped = { value };
  if (clone) {
    wrapped.value = cloneDeep(wrapped.value, true);
  }
  const valid = validator(wrapped);
  if (!valid) {
    if (validator.errors && validator.errors.length > 0) {
      throw new ValidationError(validator.errors);
    }
    throw new Error('Validation failed');
  } else if (typeof valid !== 'boolean') {
    if (typeof valid.then !== 'function') {
      throw new TypeError('There is some trouble with ajv, the return value is neither boolean nor promise');
    }
    await valid.then(noop, (error) => {
      if (!(error instanceof Ajv.ValidationError)) {
        throw error;
      }
      throw new ValidationError(error.errors);
    });
  }
  return wrapped.value as never;
}
