import cloneDeep from 'clone-deep';
import { Schema, SyncValidationFunction, AsyncValidationFunction } from '../util/schema.types';
import { ShapeHKT, BaseShape, ShapeOptions } from '../util/shape.types';
import { validateSync, validateAsync } from '../validate';
import { noop, overwriteChildrenErrorMessage } from '../util/functions';

function produce<T>(base: T, recipe: (draft: Exclude<T, undefined>) => Exclude<T, undefined> | void): T {
  const copied = cloneDeep(base ?? {}) as Exclude<T, undefined>;
  const modified = recipe(copied);
  return modified || copied;
}

export class BaseShapeImpl<T, K extends keyof ShapeHKT<T> = 'base'> implements BaseShape<T, K> {
  schema: ShapeHKT<T>[K]['schema'];
  options?: ShapeHKT<T>[K]['options'];

  constructor(schema: Schema, options?: ShapeOptions) {
    this.schema = { allOf: [{}, produce(schema, noop), {}], stripNull: true };
    this.options = produce(options, noop);
  }

  protected produce_<RT, ST extends BaseShapeImpl<T, K>>(
    this: ST,
    schemaRecipe?: (draft: ShapeHKT<T>[K]['schema']) => void,
    optionsRecipe?: (draft: Exclude<ShapeHKT<T>[K]['options'], undefined>) => void
  ): ShapeHKT<RT>[K] {
    const newInstance: ShapeHKT<RT>[K] = Object.create(Reflect.getPrototypeOf(this));
    newInstance.schema = schemaRecipe ? produce(this.schema, schemaRecipe) : this.schema;
    newInstance.options = optionsRecipe ? produce(this.options, optionsRecipe) : this.options;
    return newInstance;
  }

  optional<ST extends BaseShapeImpl<T, K>>(this: ST, optional = true): ShapeHKT<T | undefined>[K] {
    return this.produce_(undefined, (draft) => {
      draft.optional = optional;
    });
  }

  nullable<ST extends BaseShapeImpl<T, K>>(this: ST, nullable = true): ShapeHKT<T | null>[K] {
    return this.produce_((draft) => {
      draft.allOf[1].nullable = nullable;
      draft.stripNull = !nullable;
    }, undefined);
  }

  before<ST extends BaseShapeImpl<T, K>>(this: ST, schema: Schema, closest = false): ShapeHKT<T>[K] {
    return this.produce_((draft) => {
      draft.allOf[0].allOf = draft.allOf[0].allOf ?? [];
      if (closest) {
        draft.allOf[0].allOf.push(schema);
      } else {
        draft.allOf[0].allOf.unshift(schema);
      }
    }, undefined);
  }

  after<ST extends BaseShapeImpl<T, K>>(this: ST, schema: Schema, closest = false): ShapeHKT<T>[K] {
    return this.produce_((draft) => {
      draft.allOf[2].allOf = draft.allOf[2].allOf ?? [];
      if (closest) {
        draft.allOf[2].allOf.unshift(schema);
      } else {
        draft.allOf[2].allOf.push(schema);
      }
    }, undefined);
  }

  beforeSync<ST extends BaseShapeImpl<T, K>>(
    this: ST,
    validateFunction: SyncValidationFunction<T>,
    closest = false
  ): ShapeHKT<T>[K] {
    return this.produce_((draft) => {
      draft.allOf[0].allOf = draft.allOf[0].allOf ?? [];
      if (closest) {
        draft.allOf[0].allOf.push({ customSync: validateFunction });
      } else {
        draft.allOf[0].allOf.unshift({ customSync: validateFunction });
      }
    }, undefined);
  }

  afterSync<ST extends BaseShapeImpl<T, K>>(
    this: ST,
    validateFunction: SyncValidationFunction<T>,
    closest = false
  ): ShapeHKT<T>[K] {
    return this.produce_((draft) => {
      draft.allOf[2].allOf = draft.allOf[2].allOf ?? [];
      if (closest) {
        draft.allOf[2].allOf.unshift({ customSync: validateFunction });
      } else {
        draft.allOf[2].allOf.push({ customSync: validateFunction });
      }
    }, undefined);
  }

  beforeAsync<ST extends BaseShapeImpl<T, K>>(
    this: ST,
    validateFunction: AsyncValidationFunction<T>,
    closest = false
  ): ShapeHKT<T>[K] {
    return this.produce_((draft) => {
      draft.allOf[0].allOf = draft.allOf[0].allOf ?? [];
      if (closest) {
        draft.allOf[0].allOf.push({ customAsync: validateFunction });
      } else {
        draft.allOf[0].allOf.unshift({ customAsync: validateFunction });
      }
    }, undefined);
  }

  afterAsync<ST extends BaseShapeImpl<T, K>>(
    this: ST,
    validateFunction: AsyncValidationFunction<T>,
    closest = false
  ): ShapeHKT<T>[K] {
    return this.produce_((draft) => {
      draft.allOf[2].allOf = draft.allOf[2].allOf ?? [];
      if (closest) {
        draft.allOf[2].allOf.unshift({ customAsync: validateFunction });
      } else {
        draft.allOf[2].allOf.push({ customAsync: validateFunction });
      }
    }, undefined);
  }

  extend<ST extends BaseShapeImpl<T, K>, NT = T>(this: ST, schema: Schema): ShapeHKT<NT>[K] {
    return this.produce_((draft) => {
      draft.allOf[1] = { ...draft.allOf[1], ...schema };
    }, undefined);
  }

  title<ST extends BaseShapeImpl<T, K>>(this: ST, title: string): ShapeHKT<T>[K] {
    return this.extend({ title });
  }

  description<ST extends BaseShapeImpl<T, K>>(this: ST, description: string): ShapeHKT<T>[K] {
    return this.extend({ description });
  }

  message<ST extends BaseShapeImpl<T, K>>(this: ST, message: string): ShapeHKT<T>[K] {
    return this.produce_((draft) => {
      if (typeof draft.allOf[1].errorMessage === 'object' && draft.allOf[1].errorMessage !== null) {
        draft.allOf[1].errorMessage._ = message;
      } else {
        draft.allOf[1].errorMessage = message;
      }
      overwriteChildrenErrorMessage(draft.allOf[1], message);
    }, undefined);
  }

  messages<ST extends BaseShapeImpl<T, K>>(this: ST, messages: Record<string, string>): ShapeHKT<T>[K] {
    return this.produce_((draft) => {
      if (typeof draft.allOf[1].errorMessage === 'string') {
        draft.allOf[1].errorMessage = {
          _: draft.allOf[1].errorMessage,
          ...messages,
        };
      } else {
        draft.allOf[1].errorMessage = {
          ...draft.allOf[1].errorMessage,
          ...messages,
        };
      }
      if (messages._) {
        overwriteChildrenErrorMessage(draft.allOf[1], messages._);
      }
    }, undefined);
  }

  default<ST extends BaseShapeImpl<T, K>>(this: ST, value: T): ShapeHKT<Exclude<T, undefined>>[K] {
    return this.produce_((draft) => {
      draft.default = value;
    }, undefined);
  }

  example<ST extends BaseShapeImpl<T, K>>(this: ST, value: T): ShapeHKT<T>[K] {
    return this.extend({ example: value });
  }

  examples<ST extends BaseShapeImpl<T, K>>(
    this: ST,
    examples: Record<string, { value: T; summary?: string }>
  ): ShapeHKT<T>[K] {
    return this.produce_((draft) => {
      draft.allOf[1].examples = { ...draft.allOf[1].examples, ...examples };
    }, undefined);
  }

  validateSync(value: unknown, clone = true): T {
    return validateSync(this, value, clone);
  }

  validateAsync(value: unknown, clone = true): Promise<T> {
    return validateAsync(this, value, clone);
  }
}
