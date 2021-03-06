# 「形状」验证

一个用于验证数据的包，基于 Ajv 实现验证逻辑，且有受到 Joi 与 SuperStruct 的启发。

- [「形状」验证](#形状验证)
  - [主要特性](#主要特性)
  - [快速开始](#快速开始)
  - [简单介绍](#简单介绍)
    - [「形状」的定义](#形状的定义)
    - [「形状」的使用](#形状的使用)
      - [验证数据](#验证数据)
      - [基本「形状」](#基本形状)
      - [字符串「形状」](#字符串形状)
      - [数字「形状」](#数字形状)
      - [其他基本「形状」](#其他基本形状)
      - [对象「形状」](#对象形状)
      - [数组「形状」](#数组形状)
      - [元组「形状」](#元组形状)
      - [自定义](#自定义)
      - [自定义错误信息](#自定义错误信息)
      - [错误信息国际化](#错误信息国际化)
      - [类型转换](#类型转换)

## 主要特性

- 底层使用 Ajv 实现验证逻辑，执行快
- 提供类似 Joi 的 API，定义「形状」时很方便
- 提供类似 SuperStruct 的类型推断，对 TypeScript 更加友好
- 默认深拷贝数据再进行验证，为了提升性能，可以随时在验证时关闭
- 可使用自定义的验证逻辑（同步函数/异步函数）
- 可以方便地控制验证逻辑的执行顺序
- 可以直接用 Schema 创建自定义的形状

## 快速开始

```ts
import { object, string, number } from "@xuanxiaodi/shape";

const shape = object({
  name: string(),
  age: number(),
});

shape.validateSync({ name: "Tom", age: "18" });
// { name: 'Tom', age: 18 }

await shape.validateAsync({ name: "Tom", age: "18" });
// { name: 'Tom', age: 18 }
```

## 简单介绍

### 「形状」的定义

「形状」是用来约束数据的条件，与 JSON Schema 和 OpenAPI Schema 类似。

### 「形状」的使用

#### 验证数据

```ts
import { validateSync, validateAsync } from "shape-validate";

// 用包里提供的验证函数
const validatedValue = validateSync(shape, inputValue);
const validatedValue = validateSync(shape, inputValue, false); // turn off deep clone

// 用Shape实例的验证方法
const validatedValue = shape.validateSync(inputValue);
const validatedValue = shape.validateSync(inputValue, false); // turn off deep clone
```

验证函数/方法会返回验证后的数据（可能会有修改），或者抛出验证错误。

> 基本上，当形状是从别的地方传过来的时候，用验证函数；当形状是当场创建或者直接引用的时候，用验证方法。

#### 基本「形状」

```ts
import { any, boolean, date } from "shape-validate";

any(); // 这个形状初始没有任何约束条件
any().optional(); // 字段可以为undefined或者字段不在对象中出现
any().nullable(); // 字段可以为null（如果本来由type限制了不为null）
any().default("a"); // 当字段为undefined或null或空字符串时，会被修改为默认值
```

#### 字符串「形状」

```ts
import { string } from "shape-validate";

string(); // 要求对应的数据为字符串
string().minLength(5); // 最长长度
string().maxLength(20);
string().pattern(/^\p{sc=Han}$/u); // 按照正则表达式验证
string().format("email"); // 特定格式的字符串，参考Ajv的format关键字
string().trim().lowercase(); // 验证前处理
```

#### 数字「形状」

```ts
import { number, integer } from "shape-validate";

number(); // 要求对应的数据为有效数字
integer(); // 要求对应的数据为有效整数

// 以下方法也可用于integer
number().range(5, 20); // 范围约束 a <= x <= b
number().min(5).max(20); // 等价于上面的
number().range(5, 20, true); // 范围约束 a < x < b
number().min(5, true).max(20, true); // 等价于上面的
```

#### 其他基本「形状」

```ts
import { boolean, date, enumerate, constant } from "shape-validate";

any();
boolean();
date();
enumerate([1, 2, 3]);
constant(1);
```

#### 对象「形状」

```ts
import { object, number, string } from "shape-validate";

// 要求数据为一个对象，且包含字符串类型的name字段，可包含数字类型的age字段
object({ name: string(), age: number().optional() });

// 要求数据为一个对象，且包含字符串类型的name字段，数据中的其他字段将保留在验证结果中
// （默认只保留形状中有的字段）
object({ name: string() }).keepUnknown();
```

#### 数组「形状」

```ts
import { array, integer, string } from "shape-validate";

// 要求数据为一个整数数组
array(integer());
array(integer()).minSize(10); // 要求数组长度至少为10
array(integer()).maxSize(10); // 要求数组长度最多为10
array(integer()).unique(); // 要求数组元素不重复
```

#### 元组「形状」

```ts
import { tuple, integer } from "shape-validate";

// 要求数据为一个元组，包含指定的元素类型
const point2d = tuple(integer(), integer()); // (x, y)
const point3d = tuple(integer(), integer(), integer()); // (x, y, z)

// 经纬度（纬度, 经度）
const latlng = tuple(number().range(-90, 90), number().range(0, 360));
```

#### 自定义

```ts
import { custom } from "shape-validate";

// 由于Shape提供的方法没有覆盖所有Ajv支持的Schema
// 可以通过custom来由Schema直接定义新的形状
// 通过TypeScript的范型参数可以帮助确定验证通过的数据的类型
const shape = custom<string>({ type: "string", minLength: 1 });

// 在验证前后插入自定义逻辑（适用于所有形状）
shape.beforeSync((value) => value + 1);
shape.afterSync((value) => value + 1);
shape.beforeAsync(async (value) => await findReference(value));
shape.afterAsync(async (value) => await findResult(value));
```

> `custom()` 返回一个形状对象而不是形状实例, 意味着不能用方法（如 `shape.validateSync(value)`）去验证，但是仍然可以用函数（如 `validateSync(shape, value)`）验证。

#### 自定义错误信息

```ts
import { number, setKeywordMessage, setStaticMessage } from "shape-validate";

// 覆盖错误信息（会覆盖嵌套数据的错误信息，遵循就近原则）
number().message("验证失败");

// 指定Schema关键词错误信息，不会覆盖子层级
number().range(1, 10).message({
  minimum: "必须大于等于1",
  maximum: "必须小于等于10",
  // 默认关键词错误信息会覆盖嵌套数据的错误信息（遵循就近原则）
  _: "验证失败",
});

// 覆盖全局的默认错误信息
setStaticMessage("fallback", "验证失败");
setStaticMessage("rootRequired", "数据不能为空");

// 覆盖全局的关键词错误信息生成逻辑
setKeywordMessage("minimum", (path, params, schema) => {
  const name = schema.title || path || "值";
  return `${name}必须${params.exclusive ? "大于" : "大于等于"} ${params.limit}`;
});
```

#### 错误信息国际化

```ts
import { setLocale } from "shape-validate";

// 设置错误信息为中文
setLocale("zh-CN");
```

目前内置的配置有：

- `en`（英文，默认就是英文）
- `zh-CN`（中文）

#### 类型转换

这些形状的数据可以从其他值转换而来:

| shape     | from                              |
| --------- | --------------------------------- |
| boolean() | `'true', 'false', 1, 0, '1', '0'` |
| number()  | `12.34, 1234, 12.3e4`             |
| integer() | `1234`                            |
| date()    | ISO8601 Date-Time String          |

如果需要其他转换可以通过 `beforeSync()` 或者 `beforeAsync()` 来定义。
