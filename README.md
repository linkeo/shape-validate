# Shape Validate

A library to validate data, based on ajv, inspired by joi and superstruct.

- [Shape Validate](#shape-validate)
  - [Features](#features)
  - [Quick Start](#quick-start)
  - [Introduction](#introduction)
    - ["Shape"](#shape)
    - [Usage](#usage)
      - [Validation](#validation)
      - [Basic Shapes](#basic-shapes)
      - [String Shape](#string-shape)
      - [Number Shapes](#number-shapes)
      - [Other Basic Shapes](#other-basic-shapes)
      - [Object Shape](#object-shape)
      - [Array Shape](#array-shape)
      - [Tuple Shape](#tuple-shape)
      - [Custom Shape and Logic](#custom-shape-and-logic)
      - [Customize Error Messages](#customize-error-messages)
      - [i18n](#i18n)
      - [Type Coercing](#type-coercing)

## Features

- Use ajv to compile validate function, so it's fast
- Provides joi-like api, easy to use
- Provides TypeScript types, useful for inferring type of validated data.
- Deep clone data before validation, which can be turned off.
- Use user-defined functions to customize validation
- Use before/after methods to control validation order
- Define new shape directly from JSON Schema

## Quick Start

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

## Introduction

### "Shape"

"Shape" is a wrapper for JSON Schema, with some options for combining into other shapes.

### Usage

#### Validation

```ts
import { validateSync, validateAsync } from "shape-validate";

// use validate functions in this package
const validatedValue = validateSync(shape, inputValue);
const validatedValue = validateSync(shape, inputValue, false); // turn off deep clone
const validatedValue = await validateAsync(shape, inputValue);
const validatedValue = await validateAsync(shape, inputValue, false); // turn off deep clone

// use validate methods of shapes
const validatedValue = shape.validateSync(inputValue);
const validatedValue = shape.validateSync(inputValue, false); // turn off deep clone
const validatedValue = await shape.validateAsync(inputValue);
const validatedValue = await shape.validateAsync(inputValue, false); // turn off deep clone
```

Validate functions/methods will return the value after validate (value could be modified), or throw a validation error.

> Basically, you can use validation functions if shape is an input value, use methods if shape is surely an instance of shape class.

#### Basic Shapes

```ts
import { any, boolean, date } from "shape-validate";

any(); // A shape with no limit
any().optional(); // Indicate value can be omitted in object
any().nullable(); // Indicate value can be null (if limited by type)
any().default("a"); // Set value to default value if it was undefined or null or empty string
```

#### String Shape

```ts
import { string } from "shape-validate";

string(); // A shape indicating value should be string
string().minLength(5); // Indicate string length limit
string().maxLength(20); // Indicate string length limit
string().pattern(/^\p{sc=Han}$/u); // Indicate string should match an regex.
string().format("email"); // Indicate string should in specific format.
string().trim().lowercase(); // Transform string before other validation
```

#### Number Shapes

```ts
import { number, integer } from "shape-validate";

number(); // A shape indicating value should be number
integer(); // A shape indicating value should be integer

number().range(5, 20); // Indicate value should between two values (inclusive)
number().min(5).max(20); // Equivalent
number().range(5, 20, true); // Indicate value should between two values (exclusive)
number().min(5, true).max(20, true); // Equivalent
```

#### Other Basic Shapes

```ts
import { boolean, date, enumerate, constant } from "shape-validate";

boolean();
date(); // A shape indicating value should be number or string for valid date
enumerate([1, 2, 3]);
constant(1);
```

#### Object Shape

```ts
import { object, number, string } from "shape-validate";

// Each property is required by default
object({ name: string(), age: number().optional() });

// Unknown properties will be striped, use keepUnknown() to keep them
object({ name: string() }).keepUnknown();
```

#### Array Shape

```ts
import { array, integer, string } from "shape-validate";

array(integer());
array(integer()).minSize(10);
array(integer()).maxSize(10);
array(integer()).unique();
```

#### Tuple Shape

```ts
import { tuple, integer } from "shape-validate";

const point2d = tuple(integer(), integer()); // (x, y)
const point3d = tuple(integer(), integer(), integer()); // (x, y, z)

const latlng = tuple(number().range(-90, 90), number().range(0, 360));
```

#### Custom Shape and Logic

```ts
import { custom } from "shape-validate";

const shape = custom<string>({ type: "string", minLength: 1 });

// these before/after methods is for any shape.
shape.beforeSync((value) => value + 1);
shape.afterSync((value) => value + 1);
shape.beforeAsync(async (value) => await findReference(value));
shape.afterAsync(async (value) => await findResult(value));
```

> `custom()` return a shape object instead of shape instance, means you cannot use `shape.validateSync(value)` (but you can use this in `validateSync(shape, value)`).

#### Customize Error Messages

```ts
import { number, setKeywordMessage, setStaticMessage } from "shape-validate";

// Override error message for current field and any sub fields
number().message("验证失败");

// Override keyword error messages for current field only
number().range(1, 10).message({
  minimum: "必须大于等于1",
  maximum: "必须小于等于10",
  // "_" is for any other keywords, this will override sub field default error messages
  _: "验证失败",
});

// Override global default error messages
setStaticMessage("fallback", "验证失败");
setStaticMessage("rootRequired", "数据不能为空");

// Override global keyword error messages
setKeywordMessage("minimum", (path, params, schema) => {
  const name = schema.title || path || "值";
  return `${name}必须${params.exclusive ? "大于" : "大于等于"} ${params.limit}`;
});
```

#### i18n

```ts
import { setLocale } from "shape-validate";

// Set global error messages for Simplified Chinese
setLocale("zh-CN");
```

Built-in configurations：

- `en`（English, the default one）
- `zh-CN`（Simplified Chinese）

#### Type Coercing

These shape can be coerced from other values:

| shape     | from                              |
| --------- | --------------------------------- |
| boolean() | `'true', 'false', 1, 0, '1', '0'` |
| number()  | `12.34, 1234, 12.3e4`             |
| integer() | `1234`                            |
| date()    | ISO8601 Date-Time String          |

Other conversion can be defined by `beforeSync()` or `beforeAsync()`
