import { Schema } from './schema.types';

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

export function transformIntoValidationSchema(schema: Schema): Schema {
  const { before: [...before] = [], after: [...after] = [], ...rest } = schema;
  const allOf: Schema[] = [];

  // add cast keyword
  if (rest.type === 'number' || rest.type === 'integer' || rest.type === 'boolean') {
    before.push({ cast: rest.type });
  }
  if (rest.kind === 'date') {
    before.push({ cast: rest.kind });
  }

  if (before.length > 0) {
    allOf.push(...before.map(transformIntoValidationSchema));
  }

  // transform nested schemas
  if (isObject(rest.items)) {
    rest.items = transformIntoValidationSchema(rest.items);
  } else if (Array.isArray(rest.items)) {
    rest.items = rest.items.map(transformIntoValidationSchema);
  }
  if (isObject(rest.contains)) {
    rest.contains = transformIntoValidationSchema(rest.contains);
  }
  if (isObject(rest.additionalProperties)) {
    rest.additionalProperties = transformIntoValidationSchema(rest.additionalProperties);
  }
  if (isObject(rest.propertyNames)) {
    rest.propertyNames = transformIntoValidationSchema(rest.propertyNames);
  }
  if (isObject(rest.if)) {
    rest.if = transformIntoValidationSchema(rest.if);
  }
  if (isObject(rest.then)) {
    rest.then = transformIntoValidationSchema(rest.then);
  }
  if (isObject(rest.else)) {
    rest.else = transformIntoValidationSchema(rest.else);
  }
  if (Array.isArray(rest.oneOf)) {
    rest.oneOf = rest.oneOf.map(transformIntoValidationSchema);
  }
  if (Array.isArray(rest.anyOf)) {
    rest.anyOf = rest.anyOf.map(transformIntoValidationSchema);
  }
  if (Array.isArray(rest.allOf)) {
    rest.allOf = rest.allOf.map(transformIntoValidationSchema);
  }
  if (isObject(rest.properties)) {
    rest.properties = { ...rest.properties };
    for (const key of Object.keys(rest.properties)) {
      rest.properties[key] = transformIntoValidationSchema(rest.properties[key]);
    }
  }
  if (isObject(rest.patternProperties)) {
    rest.patternProperties = { ...rest.patternProperties };
    for (const key of Object.keys(rest.patternProperties)) {
      rest.patternProperties[key] = transformIntoValidationSchema(rest.patternProperties[key]);
    }
  }
  if (isObject(rest.dependencies)) {
    rest.dependencies = { ...rest.dependencies };
    for (const key of Object.keys(rest.dependencies)) {
      const value = rest.dependencies[key];
      if (isObject(value)) {
        rest.dependencies[key] = transformIntoValidationSchema(value);
      }
    }
  }

  allOf.push(rest);

  // handle after schemas
  if (after.length > 0) {
    allOf.push(...after.map(transformIntoValidationSchema));
  }

  // return result schema
  if (allOf.length > 1) {
    if (rest.default !== undefined) {
      return { allOf, default: rest.default };
    }
    return { allOf };
  }
  return allOf[0];
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
