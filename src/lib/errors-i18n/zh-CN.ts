import { BuiltInErrorMessages } from '../errors';
import { Schema } from '../util/schema.types';

const TYPES: Record<string, string> = {
  string: '字符串',
  number: '数字',
  integer: '整数',
  boolean: '布尔值',
  object: '对象',
  array: '数组',
};

const KINDS: Record<string, string> = {
  date: '时间戳',
};

const FORMATS: Record<string, string> = {
  email: '电子邮箱',
  uuid: 'UUID',
  date: '日期',
  'date-time': '日期时间',
  uri: 'URI',
  hostname: '域名',
  ipv4: 'IPv4',
  ipv6: 'IPv6',
};

function getPropertyName(schema: Schema, key: string, parentPath: string): string {
  let name = parentPath + key;
  if (schema.properties) {
    const property = schema.properties[key.slice(1)];
    if (property && property.title) {
      name = property.title;
    }
  }
  return name;
}

export default {
  static: {
    fallback: '数据验证失败',
    rootRequired: '缺少必要数据',
  },
  keyword: {
    required: (path, params, schema) => {
      return `${getPropertyName(schema, String(params.missingProperty), path)}必须提供`;
    },
    type: (path, params, schema) => {
      const name = schema.title || path || 'value';
      const type = String(params.type)
        .split(',')
        .map((t) => TYPES[t] ?? t)
        .join('或者');
      return `${name}必须是${type}`;
    },
    kind: (path, params, schema) => {
      const name = schema.title || path || 'value';
      const type = String(params.type)
        .split(',')
        .map((t) => KINDS[t] ?? t)
        .join('或者');
      return `${name}必须是${type}`;
    },
    minimum: (path, params, schema) => {
      const name = schema.title || path || 'value';
      return `${name}不能小于${params.limit}`;
    },
    maximum: (path, params, schema) => {
      const name = schema.title || path || 'value';
      return `${name}不能大于${params.limit}`;
    },
    exclusiveMinimum: (path, params, schema) => {
      const name = schema.title || path || 'value';
      return `${name}必须大于${params.limit}`;
    },
    exclusiveMaximum: (path, params, schema) => {
      const name = schema.title || path || 'value';
      return `${name}必须小于${params.limit}`;
    },
    minLength: (path, params, schema) => {
      const name = schema.title || path || 'value';
      return `${name}不能少于${params.limit}个字符`;
    },
    maxLength: (path, params, schema) => {
      const name = schema.title || path || 'value';
      return `${name}不能多于${params.limit}个字符`;
    },
    multipleOf: (path, params, schema) => {
      const name = schema.title || path || 'value';
      return `${name}必须是${params.multipleOf}的倍数`;
    },
    maxProperties: (path, params, schema) => {
      const name = schema.title || path || 'value';
      return `${name}不能多于${params.limit}个字段`;
    },
    minProperties: (path, params, schema) => {
      const name = schema.title || path || 'value';
      return `${name}不能少于${params.limit}个字段`;
    },
    maxItems: (path, params, schema) => {
      const name = schema.title || path || 'value';
      return `${name}不能多于${params.limit}个元素`;
    },
    minItems: (path, params, schema) => {
      const name = schema.title || path || 'value';
      return `${name}不能少于${params.limit}个元素`;
    },
    uniqueItems: (path, params, schema) => {
      const name = schema.title || path || 'value';
      return `${name}不能包含重复值`;
    },
    dependencies: (path, params, schema) => {
      const name = schema.title || path || 'value';
      return `${name}必须在拥有${getPropertyName(schema, String(params.property), path)}字段的同时拥有${String(
        params.deps
      )
        .split(/,\s*/g)
        .map((dep) => getPropertyName(schema, dep, path))
        .join('、')}字段`;
    },
    enum: (path, params, schema) => {
      const name = schema.title || path || 'value';
      const values = String(params.allowedValues).split(',');
      return `${name}必须是${values.length > 3 ? values.slice(0, 3).join('，') + '…' : values.join('，')}其中一个值`;
    },
    const: (path, params, schema) => {
      const name = schema.title || path || 'value';
      return `${name}必须等于${params.allowedValue}`;
    },
    format: (path, params, schema) => {
      const name = schema.title || path || 'value';
      return `${name}必须符合${FORMATS[String(params.format)] ?? params.format}格式`;
    },
    pattern: (path, params, schema) => {
      const name = schema.title || path || 'value';
      return `${name}必须符合正则表达式/${params.pattern}/`;
    },
    regexp: (path, params, schema) => {
      const name = schema.title || path || 'value';
      const pattern = schema.regexp
        ? typeof schema.regexp === 'string'
          ? schema.regexp
          : `/${schema.regexp.pattern}/${schema.regexp.flags || ''}`
        : '';
      return `${name}必须符合正则表达式${pattern}`;
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
