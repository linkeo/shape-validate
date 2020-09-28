import { object, integer } from '../lib';

const tables = ['info', 'major'];

async function checkIntegerId(table: string, id: number) {
  return Math.random() * 1000 > id;
}

const IntegerRowId = (tableName: string) => {
  if (!tables.includes(tableName)) {
    throw new Error('Invalid tableName');
  }
  return integer().afterAsync(async (id) => {
    if (await checkIntegerId(tableName, id)) {
      return;
    }
    throw new Error('Cannot find valid data by ${name}');
  });
};

// Pagination仅解析分页参数
try {
  const Params = object({
    id: IntegerRowId('info'),
    currId: IntegerRowId('info').optional(),
  });
  Params.validateAsync({ id: 30000 }).then(console.log, (err) => console.log(err.stack));
  Params.validateAsync({ id: 4, currId: 1 }).then(console.log, (err) => console.log(err.stack));
} catch (err) {
  console.log(err);
}
