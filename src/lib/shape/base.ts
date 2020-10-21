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
    this.schema = produce(schema, noop);
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

  optional<ST extends BaseShapeImpl<T, K>>(this: ST): ShapeHKT<T | undefined>[K] {
    return this.produce_(undefined, (draft) => {
      draft.optional = true;
    });
  }

  nullable<ST extends BaseShapeImpl<T, K>>(this: ST): ShapeHKT<T | null>[K] {
    return this.produce_((draft) => {
      draft.nullable = true;
    }, undefined);
  }

  before<ST extends BaseShapeImpl<T, K>>(this: ST, schema: Schema, closest = false): ShapeHKT<T>[K] {
    return this.produce_((draft) => {
      draft.before = draft.before ?? [];
      if (closest) {
        draft.before.push(schema);
      } else {
        draft.before.unshift(schema);
      }
    }, undefined);
  }

  after<ST extends BaseShapeImpl<T, K>>(this: ST, schema: Schema, closest = false): ShapeHKT<T>[K] {
    return this.produce_((draft) => {
      draft.after = draft.after ?? [];
      if (closest) {
        draft.after.unshift(schema);
      } else {
        draft.after.push(schema);
      }
    }, undefined);
  }

  beforeSync<ST extends BaseShapeImpl<T, K>>(
    this: ST,
    validateFunction: SyncValidationFunction<T>,
    closest = false
  ): ShapeHKT<T>[K] {
    return this.produce_((draft) => {
      draft.before = draft.before ?? [];
      if (closest) {
        draft.before.push({ customSync: validateFunction });
      } else {
        draft.before.unshift({ customSync: validateFunction });
      }
    }, undefined);
  }

  afterSync<ST extends BaseShapeImpl<T, K>>(
    this: ST,
    validateFunction: SyncValidationFunction<T>,
    closest = false
  ): ShapeHKT<T>[K] {
    return this.produce_((draft) => {
      draft.after = draft.after ?? [];
      if (closest) {
        draft.after.unshift({ customSync: validateFunction });
      } else {
        draft.after.push({ customSync: validateFunction });
      }
    }, undefined);
  }

  beforeAsync<ST extends BaseShapeImpl<T, K>>(
    this: ST,
    validateFunction: AsyncValidationFunction<T>,
    closest = false
  ): ShapeHKT<T>[K] {
    return this.produce_((draft) => {
      draft.before = draft.before ?? [];
      if (closest) {
        draft.before.push({ customAsync: validateFunction });
      } else {
        draft.before.unshift({ customAsync: validateFunction });
      }
    }, undefined);
  }

  afterAsync<ST extends BaseShapeImpl<T, K>>(
    this: ST,
    validateFunction: AsyncValidationFunction<T>,
    closest = false
  ): ShapeHKT<T>[K] {
    return this.produce_((draft) => {
      draft.after = draft.after ?? [];
      if (closest) {
        draft.after.unshift({ customAsync: validateFunction });
      } else {
        draft.after.push({ customAsync: validateFunction });
      }
    }, undefined);
  }

  title<ST extends BaseShapeImpl<T, K>>(this: ST, title: string): ShapeHKT<T>[K] {
    return this.produce_((draft) => {
      draft.title = title;
    }, undefined);
  }

  description<ST extends BaseShapeImpl<T, K>>(this: ST, description: string): ShapeHKT<T>[K] {
    return this.produce_((draft) => {
      draft.description = description;
    }, undefined);
  }

  message<ST extends BaseShapeImpl<T, K>>(this: ST, message: string): ShapeHKT<T>[K] {
    return this.produce_((draft) => {
      if (typeof draft.errorMessage === 'object' && draft.errorMessage !== null) {
        draft.errorMessage._ = message;
      } else {
        draft.errorMessage = message;
      }
      overwriteChildrenErrorMessage(draft, message);
    }, undefined);
  }

  messages<ST extends BaseShapeImpl<T, K>>(this: ST, messages: Record<string, string>): ShapeHKT<T>[K] {
    return this.produce_((draft) => {
      if (typeof draft.errorMessage === 'string') {
        draft.errorMessage = { _: draft.errorMessage, ...messages };
      } else {
        draft.errorMessage = { ...draft.errorMessage, ...messages };
      }
      if (messages._) {
        overwriteChildrenErrorMessage(draft, messages._);
      }
    }, undefined);
  }

  default<ST extends BaseShapeImpl<T, K>>(this: ST, value: T): ShapeHKT<Exclude<T, undefined | null>>[K] {
    return this.produce_((draft) => {
      if (value !== undefined && value !== null) {
        draft.default = value;
      }
    }, undefined);
  }

  example<ST extends BaseShapeImpl<T, K>>(this: ST, value: T): ShapeHKT<T>[K] {
    return this.produce_((draft) => {
      draft.example = value;
    }, undefined);
  }

  examples<ST extends BaseShapeImpl<T, K>>(
    this: ST,
    examples: Record<string, { value: T; summary?: string }>
  ): ShapeHKT<T>[K] {
    return this.produce_((draft) => {
      draft.examples = { ...draft.examples, ...examples };
    }, undefined);
  }

  validateSync(value: unknown, clone = true): T {
    return validateSync(this, value, clone);
  }

  validateAsync(value: unknown, clone = true): Promise<T> {
    return validateAsync(this, value, clone);
  }
}
