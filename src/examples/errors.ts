import { inspect } from 'util';
import { object, integer, string, setLocale, array } from '../lib';
import { simplifyThreePhaseSchema } from '../lib/util/functions';

setLocale('zh-CN');

const shape = object({
  age: integer().range(18, 60).title('年龄').nullable(),
  name: string().maxLength(20).title('姓名'),
  tags: array(string().minLength(1).trim().message('标签必须是字符串')).unique().title('标签'),
});

console.log('\nschema:', inspect(simplifyThreePhaseSchema(shape.schema), { depth: Infinity, colors: true }));

shape.validateAsync({ name: 'linkeo', tags: ['a', 1, 3, '3', undefined] }).then(
  (res) => {
    console.log('\nresult:', inspect(res, { depth: Infinity, colors: true }));
  },
  (err) => {
    console.log('\nerror:', err);
  }
);
