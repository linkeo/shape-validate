import { BuiltInErrorMessages } from '../errors';

export default {
  static: {
    fallback: 'validation failed',
    rootRequired: 'value is required',
  },
  keyword: {
    required: (path, params, schema) => {
      let name = path + params.missingProperty;
      if (schema.properties && typeof params.missingProperty === 'string') {
        const property = schema.properties[params.missingProperty.slice(1)];
        if (property) {
          name = property.title || name;
        }
      }
      return `${name} is required`;
    },
    type: (path, params, schema) => {
      const name = schema.title || path || 'value';
      const type = String(params.type).replace(/,/g, ' or ');
      return `${name} should be ${type}`;
    },
    kind: (path, params, schema) => {
      const name = schema.title || path || 'value';
      const type = String(schema.kind).replace(/,/g, ' or ');
      return `${name} should be ${type}`;
    },
    minimum: (path, params, schema) => {
      const name = schema.title || path || 'value';
      return `${name} should be at least ${params.limit}`;
    },
    maximum: (path, params, schema) => {
      const name = schema.title || path || 'value';
      return `${name} should be at most ${params.limit}`;
    },
    exclusiveMinimum: (path, params, schema) => {
      const name = schema.title || path || 'value';
      return `${name} should be greater than ${params.limit}`;
    },
    exclusiveMaximum: (path, params, schema) => {
      const name = schema.title || path || 'value';
      return `${name} should be less than ${params.limit}`;
    },
    minLength: (path, params, schema) => {
      const name = schema.title || path || 'value';
      return `${name} should have at least ${params.limit} ${params.limit === 1 ? 'character' : 'characters'}`;
    },
    maxLength: (path, params, schema) => {
      const name = schema.title || path || 'value';
      return `${name} should have at most ${params.limit} ${params.limit === 1 ? 'character' : 'characters'}`;
    },
    multipleOf: (path, params, schema) => {
      const name = schema.title || path || 'value';
      return `${name} should be multiple of ${params.multipleOf}`;
    },
    maxProperties: (path, params, schema) => {
      const name = schema.title || path || 'value';
      return `${name} should have at most ${params.limit} ${params.limit === 1 ? 'property' : 'properties'}`;
    },
    minProperties: (path, params, schema) => {
      const name = schema.title || path || 'value';
      return `${name} should have at least ${params.limit} ${params.limit === 1 ? 'property' : 'properties'}`;
    },
    maxItems: (path, params, schema) => {
      const name = schema.title || path || 'value';
      return `${name} should have at most ${params.limit} ${params.limit === 1 ? 'item' : 'items'}`;
    },
    minItems: (path, params, schema) => {
      const name = schema.title || path || 'value';
      return `${name} should have at least ${params.limit} ${params.limit === 1 ? 'item' : 'items'}`;
    },
    uniqueItems: (path, params, schema) => {
      const name = schema.title || path || 'value';
      return `${name} should have unique items`;
    },
    dependencies: (path, params, schema) => {
      const name = schema.title || path || 'value';
      return `${name} should have ${Number(params.depsCount) >= 1 ? 'properties' : 'property'} ${
        params.deps
      } when property ${params.property} exists`;
    },
    enum: (path, params, schema) => {
      const name = schema.title || path || 'value';
      const values = String(params.allowedValues).split(',');
      return `${name} should be one of ${
        values.length > 3 ? values.slice(0, 3).join(', ') + '...' : values.join(', ')
      }`;
    },
    const: (path, params, schema) => {
      const name = schema.title || path || 'value';
      return `${name} should equal to ${params.allowedValue}`;
    },
    format: (path, params, schema) => {
      const name = schema.title || path || 'value';
      return `${name} should be ${params.format} string`;
    },
    pattern: (path, params, schema) => {
      const name = schema.title || path || 'value';
      return `${name} should match pattern /${params.pattern}/`;
    },
    regexp: (path, params, schema) => {
      const name = schema.title || path || 'value';
      const pattern = schema.regexp
        ? typeof schema.regexp === 'string'
          ? schema.regexp
          : `/${schema.regexp.pattern}/${schema.regexp.flags || ''}`
        : '';
      return `${name} should match pattern ${pattern}`;
    },
    customSync: (path, params, schema) => {
      const name = schema.title || path || 'value';
      if (params && typeof params.message === 'string' && params.message) {
        return params.message.replace(/\$\{name\}/g, name);
      }
      return '';
    },
    customAsync: (path, params, schema) => {
      const name = schema.title || path || 'value';
      if (params && typeof params.message === 'string' && params.message) {
        return params.message.replace(/\$\{name\}/g, name);
      }
      return '';
    },
  },
} as BuiltInErrorMessages;
