import { object, integer, string, merge } from '../lib';

// 假设有一个GET请求，带分页参数，page从1开始
const uri = new URL('https://example.com/list?page=1&pageSize=15&keyword=foo');
const query = Object.fromEntries(uri.searchParams.entries());

// Pagination仅解析分页参数
const Pagination = object({
  page: integer().default(1).range(1, 1000),
  pageSize: integer().default(20).range(1, 1000),
});
const result1 = Pagination.validateSync(query);
console.log(result1);

// 可以用merge组合别的参数进来
const PaginationWithKeyword = merge(Pagination, object({ keyword: string() }));
const result2 = PaginationWithKeyword.validateSync(query);
console.log(result2);

// 最终不影响原有的query
console.log(query);
