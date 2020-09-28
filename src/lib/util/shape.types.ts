import {
  Schema,
  StringSchemaBuiltinFormat,
  StringSchema,
  NumberSchema,
  IntegerSchema,
  ObjectSchema,
  ArraySchema,
  ThreePhraseSchema,
  SyncValidationFunction,
  AsyncValidationFunction,
} from './schema.types';

export interface ShapeHKT<T> {
  base: AnyShape<T>;
  string: StringShape<T>;
  number: NumberShape<T>;
  array: ArrayShape<T>;
  tuple: TupleShape<T>;
  object: ObjectShape<T>;
}

/**
 * 基本的「形状」定义，包括用于验证的 Schema 和一些选项
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface Shape<T = unknown> {
  schema: ThreePhraseSchema;
  options?: ShapeOptions;
}

/**
 * 「形状」的选项
 */
export interface ShapeOptions {
  /** 这个形状是否可选（可以为 `undefined`） */
  optional?: boolean;
}

/**
 * 类型提取工具，从「形状」的类型中提取出值的类型
 */
export type ShapeValue<ST> = ST extends BaseShape<infer T, never> ? T : ST extends Shape<infer T> ? T : never;

/**
 * 基本的「形状」实例类型，提供一些方法用于派生新的「形状」
 */
export interface BaseShape<T, SI extends keyof ShapeHKT<T>> extends Shape<T> {
  /** 派生一个新的「形状」，将值标记为可选与否（可以为 `undefined`） */
  optional(optional?: boolean): ShapeHKT<T | undefined>[SI];
  /** 派生一个新的「形状」，值可以为 `null`（如果没有默认值，自动将默认值设为 `null`） */
  nullable(nullable?: boolean): ShapeHKT<T | null>[SI];
  /** 派生一个新的「形状」，在验证前执行另外的验证逻辑（Schema） */
  before(schema: Schema, closest?: boolean): ShapeHKT<T>[SI];
  /** 派生一个新的「形状」，在验证后执行另外的验证逻辑（Schema） */
  after(schema: Schema, closest?: boolean): ShapeHKT<T>[SI];
  /** 派生一个新的「形状」，在验证前执行另外的验证逻辑（同步函数） */
  beforeSync(validateFunction: SyncValidationFunction<T>, closest?: boolean): ShapeHKT<T>[SI];
  /** 派生一个新的「形状」，在验证后执行另外的验证逻辑（同步函数） */
  afterSync(validateFunction: SyncValidationFunction<T>, closest?: boolean): ShapeHKT<T>[SI];
  /** 派生一个新的「形状」，在验证前执行另外的验证逻辑（异步函数） */
  beforeAsync(validateFunction: AsyncValidationFunction<T>, closest?: boolean): ShapeHKT<T>[SI];
  /** 派生一个新的「形状」，在验证后执行另外的验证逻辑（异步函数） */
  afterAsync(validateFunction: AsyncValidationFunction<T>, closest?: boolean): ShapeHKT<T>[SI];
  /** 派生一个新的「形状」，扩展验证的 Schema（可以指定新的值类型） */
  extend<NT = T>(schema: Schema): ShapeHKT<NT>[SI];
  /** 派生一个新的「形状」，增加描述信息 */
  title(title: string): ShapeHKT<T>[SI];
  /** 派生一个新的「形状」，增加描述信息 */
  description(description: string): ShapeHKT<T>[SI];
  /** 派生一个新的「形状」，指定一个默认值 */
  default(value: T): ShapeHKT<Exclude<T, undefined>>[SI];
  /** 派生一个新的「形状」，增加描述信息 */
  example(value: T): ShapeHKT<T>[SI];
  /** 派生一个新的「形状」，增加描述信息 */
  examples(examples: Record<string, { value: T; summary?: string }>): ShapeHKT<T>[SI];
  /** 派生一个新的「形状」，增加错误信息 */
  message(message: string): ShapeHKT<T>[SI];
  /** 派生一个新的「形状」，增加错误信息 */
  messages(messages: Record<string, string>): ShapeHKT<T>[SI];

  /**
   * 同步验证数据是否符合「形状」
   * - 验证通过时，返回验证后的数据
   * - 验证不通过时，抛出 ValidationError 的实例
   * - 不支持异步验证
   * @param value 要验证的数据
   * @param clone 是否在验证前深拷贝数据（默认开启）
   */
  validateSync(value: unknown, clone?: boolean): T;

  /**
   * 异步验证数据是否符合「形状」
   * - 验证通过时，Promise 返回验证后的数据
   * - 验证不通过时，Promise 抛出 ValidationError 的实例
   * - 支持异步验证
   * @param value 要验证的数据
   * @param clone 是否在验证前深拷贝数据（默认开启）
   */
  validateAsync(value: unknown, clone?: boolean): Promise<T>;
}

/**
 * 描述任意的「形状」实例类型
 */
export type AnyShape<T = unknown> = BaseShape<T, 'base'>;

/**
 * 描述字符串值的「形状」实例类型，提供一些用于字符串值的方法用于派生新的「形状」
 */
export interface StringShape<T> extends BaseShape<T, 'string'> {
  schema: ThreePhraseSchema<StringSchema>;
  /** 派生一个新的「形状」，验证字符串的最小长度 */
  minLength(length: number): StringShape<T>;
  /** 派生一个新的「形状」，验证字符串的最大长度 */
  maxLength(length: number): StringShape<T>;
  /** 派生一个新的「形状」，使用正则表达式验证字符串 */
  pattern(length: RegExp): StringShape<T>;
  /** 派生一个新的「形状」，使用固定格式验证字符串 */
  format(length: StringSchemaBuiltinFormat): StringShape<T>;

  /** 派生一个新的「形状」，在验证前去除字符串头尾的空白字符 */
  trim(): StringShape<T>;
  /** 派生一个新的「形状」，在验证前将字符串转为小写 */
  lowercase(): StringShape<T>;
  /** 派生一个新的「形状」，在验证前将字符串转为大写 */
  uppercase(): StringShape<T>;
}

/**
 * 描述数字值的「形状」实例类型，提供一些用于数字值的方法用于派生新的「形状」
 */
export interface NumberShape<T> extends BaseShape<T, 'number'> {
  schema: ThreePhraseSchema<NumberSchema | IntegerSchema>;
  /** 派生一个新的「形状」，验证数字的最小值（默认可相等，可以指定为不可相等） */
  min(value: number, exclusive?: boolean): NumberShape<T>;
  /** 派生一个新的「形状」，验证数字的最大值（默认可相等，可以指定为不可相等） */
  max(value: number, exclusive?: boolean): NumberShape<T>;
  /** 派生一个新的「形状」，验证数字的范围（默认可相等，可以指定为不可相等） */
  range(min: number, max: number, exclusive?: boolean): NumberShape<T>;
  /** 派生一个新的「形状」，验证数字必须是某个数的倍数 */
  multipleOf(base: number): NumberShape<T>;
}

/**
 * 描述对象值的「形状」实例类型，提供一些用于对象值的方法用于派生新的「形状」
 */
export interface ObjectShape<T> extends BaseShape<T, 'object'> {
  schema: ThreePhraseSchema<ObjectSchema>;
  /** 派生一个新的「形状」，通过验证时，保留对象中未定义的属性 */
  keepUnknown(keep?: boolean): ObjectShape<T>;
}

/**
 * 描述数组值的「形状」实例类型，提供一些用于数组值的方法用于派生新的「形状」
 */
export interface ArrayShape<T> extends BaseShape<T, 'array'> {
  schema: ThreePhraseSchema<ArraySchema>;
  minSize(size: number): ArrayShape<T>;
  maxSize(size: number): ArrayShape<T>;
  unique(unique?: boolean): ArrayShape<T>;
}

/**
 * 描述元组值的「形状」实例类型，提供一些用于元组值的方法用于派生新的「形状」
 */
export interface TupleShape<T> extends BaseShape<T, 'tuple'> {
  schema: ThreePhraseSchema<ArraySchema>;
}
