import { BaseShape, Shape, ShapeValue } from '../util/shape.types';
import { BaseShapeImpl } from './base';

type TupleShapeValue<ST extends unknown[]> = {
  [P in keyof ST]: ShapeValue<ST[P]>;
};

type UnionShapeValue<ST extends unknown[]> = TupleShapeValue<ST>[number];

type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

type IntersectionShapeValue<ST extends unknown[]> = UnionToIntersection<UnionShapeValue<ST>>;

/**
 * 创建一个「形状」用于描述不符合另一个「形状」的值
 * @param shape 不符合的那个「形状」
 */
export function not(shape: Shape): BaseShape<unknown, 'base'> {
  return new BaseShapeImpl({ not: shape.schema });
}

/**
 * 创建一个「形状」用于描述只符合一个指定「形状」的值
 * @param shapes 可传入多个「形状」，值只能符合其中一个（会根据顺序执行值类型转换）
 */
export function oneOf<T extends Shape[]>(...shapes: T): BaseShape<UnionShapeValue<T>, 'base'> {
  return new BaseShapeImpl({ oneOf: shapes.map((shape) => shape.schema) });
}

/**
 * 创建一个「形状」用于描述符合任意指定「形状」的值
 *
 * *值会按照「形状」的执行顺序进行转换*
 * @param shapes 可传入多个「形状」，值需要符合其中任意个形状（会根据顺序执行值类型转换）
 */
export function anyOf<T extends Shape[]>(...shapes: T): BaseShape<UnionShapeValue<T>, 'base'> {
  return new BaseShapeImpl({ anyOf: shapes.map((shape) => shape.schema) });
}

/**
 * 创建一个「形状」用于描述符合所有指定「形状」的值
 * @param shapes 可传入多个「形状」，值必须符合其中所有的形状（会根据顺序执行值类型转换）
 */
export function allOf<T extends Shape[]>(...shapes: T): BaseShape<IntersectionShapeValue<T>, 'base'> {
  return new BaseShapeImpl({ allOf: shapes.map((shape) => shape.schema) });
}

/**
 * 创建一个「形状」用于描述有条件的「形状」
 * @param condition 用作条件的「形状」，只有符合这个形状，才要求符合下面的形状
 * @param pass 用作结果的「形状」，只要符合前面的条件，就需要验证这个「形状」
 */
export function ifThen<T>(condition: Shape, pass: Shape<T>): BaseShape<never | T, 'base'> {
  return new BaseShapeImpl({ if: condition.schema, then: pass.schema });
}

/**
 * 创建一个「形状」用于描述有条件的「形状」
 * @param condition 用作条件的「形状」，只有不符合这个形状，才要求符合下面的形状
 * @param fail 用作结果的「形状」，只要不符合前面的条件，就需要验证这个「形状」
 */
export function ifElse<T>(condition: Shape, fail: Shape<T>): BaseShape<never | T, 'base'> {
  return new BaseShapeImpl({ if: condition.schema, else: fail.schema });
}

/**
 * 创建一个「形状」用于描述有条件的「形状」
 * @param condition 用作条件的「形状」，根据符合这个形状与否，要求符合下面的某一个形状
 * @param pass 用作结果的「形状」，只要符合前面的条件，就需要验证这个「形状」
 * @param fail 用作结果的「形状」，只要不符合前面的条件，就需要验证这个「形状」
 */
export function ifThenElse<T, U>(condition: Shape, pass: Shape<T>, fail: Shape<U>): BaseShape<T | U, 'base'> {
  return new BaseShapeImpl({ if: condition.schema, then: pass.schema, else: fail.schema });
}
