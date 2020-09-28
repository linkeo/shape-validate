import { Schema, ThreePhraseSchema } from './schema.types';

const asyncKeywords = ['customAsync'];

export function noop(): void {
  /* Do nothing here */
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value != null && Reflect.getPrototypeOf(value) === Object.prototype;
}

function* iterateChildren(schema: Schema): Generator<Schema> {
  // directly nested schema
  if (isObject(schema.items)) {
    yield schema.items;
  }
  if (isObject(schema.contains)) {
    yield schema.contains;
  }
  if (isObject(schema.additionalProperties)) {
    yield schema.additionalProperties;
  }
  if (isObject(schema.propertyNames)) {
    yield schema.propertyNames;
  }
  if (isObject(schema.if)) {
    yield schema.if;
  }
  if (isObject(schema.then)) {
    yield schema.then;
  }
  if (isObject(schema.else)) {
    yield schema.else;
  }

  // nested schema in array
  if (Array.isArray(schema.items)) {
    for (const child of schema.items) {
      yield child;
    }
  }
  if (Array.isArray(schema.oneOf)) {
    for (const child of schema.oneOf) {
      yield child;
    }
  }
  if (Array.isArray(schema.anyOf)) {
    for (const child of schema.anyOf) {
      yield child;
    }
  }
  if (Array.isArray(schema.allOf)) {
    for (const child of schema.allOf) {
      yield child;
    }
  }

  // nested schema in object
  if (isObject(schema.properties)) {
    for (const child of Object.values(schema.properties)) {
      yield child;
    }
  }
  if (isObject(schema.patternProperties)) {
    for (const child of Object.values(schema.patternProperties)) {
      yield child;
    }
  }
  if (isObject(schema.dependencies)) {
    for (const child of Object.values(schema.dependencies)) {
      if (isObject(child)) {
        yield child;
      }
    }
  }
}

export function checkAsyncSchema(schema: Schema): boolean {
  if (!schema) {
    return false;
  }
  if (asyncKeywords.some((keyword) => keyword in schema)) {
    return true;
  }
  for (const child of iterateChildren(schema)) {
    if (checkAsyncSchema(child)) {
      return true;
    }
  }
  return false;
}

/**
 * 简化三阶段Schema，将空的执行阶段去除，并且在可能的情况下去掉allOf层级
 */
export function simplifyThreePhaseSchema(threePhraseSchema: ThreePhraseSchema): Schema {
  const {
    allOf: [before, main, after],
    ...rest
  } = threePhraseSchema;

  const hasBefore = before.allOf && before.allOf.length > 0;
  const hasAfter = after.allOf && after.allOf.length > 0;
  if (hasBefore && hasAfter) {
    return threePhraseSchema;
  } else if (hasBefore) {
    return { ...rest, allOf: [before, main] };
  } else if (hasAfter) {
    return { ...rest, allOf: [main, after] };
  }
  return { ...rest, ...main };
}

export function overwriteChildrenErrorMessage(schema: Schema, message: string): void {
  if (!schema) {
    return;
  }
  for (const child of iterateChildren(schema)) {
    if (isObject(child.errorMessage) && !child.errorMessage._) {
      child.errorMessage._ = message;
      overwriteChildrenErrorMessage(child, message);
    } else if (!child.errorMessage) {
      child.errorMessage = message;
      overwriteChildrenErrorMessage(child, message);
    }
  }
}
