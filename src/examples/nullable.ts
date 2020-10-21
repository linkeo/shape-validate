import util from 'util';
import { anyOf, array, number, string, tuple } from '../lib';
import { transformIntoValidationSchema } from '../lib/util/functions';

const shapes = {
  'array(anyOf(number(), string()))': array(anyOf(number(), string())),
  'anyOf(number(), string())': anyOf(number(), string()),
  'tuple(string().default("abc"))': tuple(string().default('abc')),
  'tuple(string())': tuple(string()),
  'array(string().default("abc"))': array(string().default('abc')).minSize(1).maxSize(1),
};

const values = [[1, 'a'], 'a', []];

for (const [key, shape] of Object.entries(shapes)) {
  console.log('\n' + key);
  console.log('schema=' + util.inspect(transformIntoValidationSchema(shape.schema), { colors: true, depth: Infinity }));
  for (const value of values) {
    console.log('>', util.inspect(value, { colors: true, depth: Infinity }));
    try {
      const result = shape.validateSync(value);
      console.log('  ->', util.inspect(result, { colors: true, depth: Infinity }));
    } catch (err) {
      console.log('  -!', err.message);
    }
  }
}
