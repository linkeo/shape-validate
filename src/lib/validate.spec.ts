import { AnyShape } from './util/shape.types';
import { any, string, number, integer, object, boolean, date, array, anyOf } from './index';

type ExpectAccept = { type: 'accept'; name: string; input: unknown; output: unknown };
type ExpectReject = { type: 'reject'; name: string; input: unknown; message: string };

function pass(name: string, value: unknown): ExpectAccept {
  return { type: 'accept', name, input: value, output: value };
}

function coerce(name: string, input: unknown, output: unknown): ExpectAccept {
  return { type: 'accept', name, input, output };
}

function reject(name: string, input: unknown, message: string): ExpectReject {
  return { type: 'reject', name, input, message };
}

class TempClass {
  hello(): void {
    console.log('hello');
  }
}

const now = Date.now();

const testData: {
  name: string;
  shape: AnyShape;
  expects: (ExpectAccept | ExpectReject)[];
}[] = [
  {
    name: 'any()',
    shape: any(),
    expects: [
      pass('null', null),
      pass('string', 'ABCdef'),
      pass('number', 12.34),
      pass('regexp', /11/),
      pass('class instance', new TempClass()),
      reject('undefined', undefined, 'value is required'),
    ],
  },
  {
    name: 'number()',
    shape: number(),
    expects: [
      pass('integer', 1231),
      pass('decimal', 1231.12),
      coerce('integer string', '1231', 1231),
      coerce('decimal string', '1231.12', 1231.12),
      reject('non-number string', 'string', 'value should be number'),
      reject('undefined', undefined, 'value is required'),
    ],
  },
  {
    name: 'number().min(10)',
    shape: number().min(10),
    expects: [
      pass('10e6', 10e6),
      pass('10', 10),
      pass('10.0001', 10.0001),
      reject('9', 9, 'value should be at least 10'),
      reject('9.9999', 9.9999, 'value should be at least 10'),
      reject('-10', -10, 'value should be at least 10'),
      reject('NaN', NaN, 'value should be number'),
    ],
  },
  {
    name: 'integer()',
    shape: integer(),
    expects: [
      pass('integer', 1231),
      reject('true', true, 'value should be integer'),
      reject('false', false, 'value should be integer'),
      coerce('integer string', '1231', 1231),
      reject('decimal string', '123.12', 'value should be integer'),
      reject('non-number string', 'string', 'value should be integer'),
      reject('decimal', 123.12, 'value should be integer'),
      reject('undefined', undefined, 'value is required'),
    ],
  },
  {
    name: 'string()',
    shape: string(),
    expects: [
      reject('integer', 1231, 'value should be string'),
      reject('decimal', 123.12, 'value should be string'),
      reject('true', true, 'value should be string'),
      reject('false', false, 'value should be string'),
      pass('integer string', '1231'),
      pass('decimal string', '123.12'),
      pass('non-number string', 'string'),
      reject('undefined', undefined, 'value is required'),
      reject('null', null, 'value should be string'),
    ],
  },
  {
    name: 'string().nullable()',
    shape: string().nullable(),
    expects: [
      reject('integer', 1231, 'value should be string'),
      reject('decimal', 123.12, 'value should be string'),
      reject('true', true, 'value should be string'),
      reject('false', false, 'value should be string'),
      pass('integer string', '1231'),
      pass('decimal string', '123.12'),
      pass('non-number string', 'string'),
      reject('undefined', undefined, 'value is required'),
      pass('null', null),
    ],
  },
  {
    name: 'boolean()',
    shape: boolean(),
    expects: [
      pass('boolean true', true),
      pass('boolean false', false),
      coerce('string true', 'true', true),
      coerce('string false', 'false', false),
      coerce('number 1', 1, true),
      coerce('number 0', 0, false),
      coerce('string 1', '1', true),
      coerce('string 0', '0', false),
      reject('string t', 't', 'value should be boolean'),
      reject('string f', 'f', 'value should be boolean'),
      reject('other string', 'string', 'value should be boolean'),
      reject('null', null, 'value should be boolean'),
    ],
  },
  {
    name: 'boolean().nullable()',
    shape: boolean().nullable(),
    expects: [
      pass('boolean true', true),
      pass('boolean false', false),
      coerce('string true', 'true', true),
      coerce('string false', 'false', false),
      coerce('number 1', 1, true),
      coerce('number 0', 0, false),
      coerce('string 1', '1', true),
      coerce('string 0', '0', false),
      reject('string t', 't', 'value should be boolean'),
      reject('string f', 'f', 'value should be boolean'),
      reject('other string', 'string', 'value should be boolean'),
      pass('null', null),
    ],
  },
  {
    name: 'date()',
    shape: date(),
    expects: [
      pass('date instance', new Date()),
      reject('epoch milliseconds as number', now, 'value should be date'),
      reject('epoch milliseconds as string', String(now), 'value should be date'),
      coerce('iso8601 date', '2020-09-09T09:09:09.099Z', new Date('2020-09-09T09:09:09.099Z')),
      reject('ecma262 date', 'Fri Sep 11 2020 15:50:25 GMT+0800 (GMT+08:00)', 'value should be date'),
      reject('other string', 'string', 'value should be date'),
      reject('null', null, 'value should be date'),
    ],
  },
  {
    name: 'date().nullable()',
    shape: date().nullable(),
    expects: [
      pass('date instance', new Date()),
      reject('epoch milliseconds as number', now, 'value should be date'),
      reject('epoch milliseconds as string', String(now), 'value should be date'),
      coerce('iso8601 date', '2020-09-09T09:09:09.099Z', new Date('2020-09-09T09:09:09.099Z')),
      reject('ecma262 date', 'Fri Sep 11 2020 15:50:25 GMT+0800 (GMT+08:00)', 'value should be date'),
      reject('other string', 'string', 'value should be date'),
      pass('null', null),
    ],
  },
  {
    name: 'array(any())',
    shape: array(any()),
    expects: [
      pass('[]', []),
      pass('["abc", "def"]', ['abc', 'def']),
      pass('[1, 2, 3]', [1, 2, 3]),
      reject('""', '', 'value should be array'),
      reject('"abc"', 'abc', 'value should be array'),
      reject('1', 1, 'value should be array'),
    ],
  },
  {
    name: 'array(string())',
    shape: array(string()),
    expects: [
      pass('[]', []),
      pass('["abc", "def"]', ['abc', 'def']),
      reject('[1, 2, 3]', [1, 2, 3], '[0] should be string'),
      reject('[true, false]', [true, false], '[0] should be string'),
      reject('""', '', 'value should be array'),
      reject('"abc"', 'abc', 'value should be array'),
      reject('1', 1, 'value should be array'),
    ],
  },
  {
    name: 'array(number())',
    shape: array(number()),
    expects: [
      pass('[]', []),
      coerce('["1", "2", "3"]', ['1', '2', '3'], [1, 2, 3]),
      reject('[true, false]', [true, false], '[0] should be number'),
      reject('["abc", "def"]', ['abc', 'def'], '[0] should be number'),
      reject('""', '', 'value should be array'),
      reject('"abc"', 'abc', 'value should be array'),
      reject('1', 1, 'value should be array'),
    ],
  },
  {
    name: 'array(anyOf(number(), string()))',
    shape: array(anyOf(number(), string())),
    expects: [
      pass('[]', []),
      coerce('["1", "2", "3"]', ['1', '2', '3'], [1, 2, 3]),
      reject('[true, false]', [true, false], '[0] should be number'),
      coerce('["1", "a"]', ['1', 'a'], [1, 'a']),
      reject('""', '', 'value should be array'),
      reject('"abc"', 'abc', 'value should be array'),
      reject('1', 1, 'value should be array'),
    ],
  },
  {
    name: 'object({ a: number(), b: string() }).keepUnknown()',
    shape: object({ a: number(), b: string() }).keepUnknown(),
    expects: [
      pass('{ a: 1, b: "a" }', { a: 1, b: 'a' }),
      pass('{ a: 1, b: "a", c: 2 }', { a: 1, b: 'a', c: 2 }),
      reject('{}', {}, 'a is required'),
      coerce('{ a: "1", b: "1" }', { a: '1', b: '1' }, { a: 1, b: '1' }),
      reject('{ a: 1, b: 1 }', { a: 1, b: 1 }, 'b should be string'),
      reject('""', '', 'value should be object'),
      reject('"abc"', 'abc', 'value should be object'),
      reject('1', 1, 'value should be object'),
    ],
  },
  {
    name: 'object({ a: number(), b: string() })',
    shape: object({ a: number(), b: string() }),
    expects: [
      pass('{ a: 1, b: "a" }', { a: 1, b: 'a' }),
      coerce('{ a: 1, b: "a", c: 2 }', { a: 1, b: 'a', c: 2 }, { a: 1, b: 'a' }),
      reject('{}', {}, 'a is required'),
      coerce('{ a: "1", b: "1" }', { a: '1', b: '1' }, { a: 1, b: '1' }),
      reject('{ a: 1, b: 1 }', { a: 1, b: 1 }, 'b should be string'),
      reject('""', '', 'value should be object'),
      reject('"abc"', 'abc', 'value should be object'),
      reject('1', 1, 'value should be object'),
    ],
  },
];

for (const testItem of testData) {
  describe(testItem.name, () => {
    if (testItem.expects.length > 0) {
      for (const item of testItem.expects) {
        const name =
          item.type === 'reject' ? `${item.type} ${item.name} <${item.message}>` : `${item.type} ${item.name}`;
        test(name, () => {
          if (item.type === 'accept') {
            expect(testItem.shape.validateSync(item.input)).toEqual(item.output);
          } else {
            expect(() => testItem.shape.validateSync(item.input)).toThrowError(item.message);
          }
        });
      }
    }
  });
}
