import { ErrorObject } from 'ajv';
import { Schema } from './util/schema.types';

type MessageFactory = (dataPath: string, params: Record<string, unknown>, schema: Schema) => string;

const staticMessageKeys = ['fallback', 'rootRequired'] as const;
const staticMessages: Record<typeof staticMessageKeys[number], string> = {
  fallback: 'validation failed',
  rootRequired: 'value is required',
};

export type BuiltInErrorMessages = {
  static: Record<typeof staticMessageKeys[number], string>;
  keyword: Record<string, MessageFactory>;
};

const keywordMessages: Record<string, MessageFactory> = {
  not: () => staticMessages.fallback,
  oneOf: () => staticMessages.fallback,
  contains: () => staticMessages.fallback,
};

export class ValidationError extends Error {
  constructor(errors: ErrorObject[] | undefined | null) {
    super('');
    this.message = makeErrorMessage(errors);
    Error.captureStackTrace(this, ValidationError);
  }
}

export function setLocaleMessages(messages: BuiltInErrorMessages): void {
  Object.assign(staticMessages, messages.static);
  Object.assign(keywordMessages, messages.keyword);
}

export function setStaticMessage(key: typeof staticMessageKeys[number], message: string): void {
  if (typeof key !== 'string') {
    throw new Error('key is not string');
  }
  if (typeof message !== 'string') {
    throw new Error('message is not string');
  }
  if (!staticMessageKeys.includes(key)) {
    throw new Error('Invalid static message key: ' + key);
  }
  staticMessages[key] = message;
}

export function setKeywordMessage(key: string, messageFactory: MessageFactory): void {
  if (typeof key !== 'string') {
    throw new Error('key is not string');
  }
  if (typeof messageFactory !== 'function') {
    throw new Error('messageFactory is not function');
  }
  keywordMessages[key] = messageFactory;
}

function makeErrorMessage(errors: ErrorObject[] | undefined | null): string {
  if (!errors || !errors[0]) {
    return staticMessages.fallback;
  }
  const error = errors[0];
  if (error.dataPath.slice(0, 6) !== '.value') {
    if (error.keyword === 'required') {
      return staticMessages.rootRequired;
    }
    return staticMessages.fallback;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const schema = error.parentSchema as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const params = error.params as any;
  const dataPath: string = error.dataPath.slice(6);

  // console.log(error);

  // Use custom errorMessage keyword
  if (schema.errorMessage != null) {
    let message = schema.errorMessage;
    if (typeof message === 'string') {
      return message;
    }
    message = schema.errorMessage?.[error.keyword];
    if (typeof message === 'string') {
      return message;
    }
    message = schema.errorMessage?._;
    if (typeof message === 'string') {
      return message;
    }
  }

  // Generate error message
  const factory = keywordMessages[error.keyword];
  if (typeof factory === 'function') {
    const generated = factory(dataPath, params, schema);
    return generated || staticMessages.fallback;
  }
  return staticMessages.fallback;
}
