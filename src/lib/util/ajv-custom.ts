import { Ajv, ValidationError, ErrorObject } from 'ajv';

export default function AjvCustom(ajv: Ajv): void {
  ajv.addFormat('number', /^-?\d+(\.\d+)?(e-?\d+)?$/);
  ajv.addFormat('integer', /^-?\d+$/);

  ajv.addKeyword('errorMessage', { valid: true });
  ajv.addKeyword('cast', {
    async: false,
    modifying: true,
    metaSchema: { enum: ['date', 'boolean', 'number', 'integer'] },
    inline: (it, _keyword, schema) => {
      if (!(it.dataLevel > 0)) {
        return 'true';
      }
      const value = `data${it.dataLevel}`;
      const refer = `data${it.dataLevel - 1 || ''}[${it.dataPathArr[it.dataLevel]}]`;
      let cond = 'true';
      let next = value;
      switch (schema) {
        case 'date':
          cond = `formats['date-time'].test(${value})`;
          next = `new Date(${value})`;
          break;
        case 'number':
          cond = `formats.number.test(${value})`;
          next = `Number(${value})`;
          break;
        case 'integer':
          cond = `formats.integer.test(${value})`;
          next = `Number(${value})`;
          break;
        case 'boolean':
          cond = `(${value} === true || ${value} === 'true' || ${value} === 1 || ${value} === '1' || ${value} === false || ${value} === 'false' || ${value} === 0 || ${value} === '0')`;
          next = `(${value} === true || ${value} === 'true' || ${value} === 1 || ${value} === '1')`;
          break;
        default:
          break;
      }
      return `(${value} != null && ${cond} && (${value} = ${refer} = ${next}), true)`;
    },
  });
  ajv.addKeyword('kind', {
    async: false,
    modifying: false,
    metaSchema: { enum: ['date'] },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    inline: (it, _keyword, schema, parentSchema: any) => {
      const value = `data${it.dataLevel}`;
      const prefix = parentSchema.nullable ? `${value} === null || ` : '';
      switch (schema) {
        case 'date':
          return `${prefix}${value} instanceof Date && Number.isSafeInteger(${value}.valueOf())`;
        default:
          return 'true';
      }
    },
  });
  ajv.addKeyword('customSync', {
    async: false,
    modifying: true,
    compile: (schema, parentSchema, it) => {
      const schemaPath = it.schemaPath;
      const func: {
        <T extends string | number>(
          data: unknown,
          dataPath: string | undefined,
          parentData: Record<T, unknown> | undefined,
          propertyName: T | undefined
        ): boolean;
        errors?: ErrorObject[] | undefined;
      } = (data, dataPath, parentData, propertyName) => {
        try {
          const value = schema(data);
          if (parentData != null && propertyName != null) {
            parentData[propertyName] = value;
          }
          return true;
        } catch (err) {
          func.errors = [
            {
              keyword: 'customSync',
              dataPath: dataPath ?? '',
              schemaPath,
              params: { message: err.message, stack: err.stack },
              schema,
              parentSchema,
              data,
            },
          ];
          return false;
        }
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return func as any;
    },
  });
  ajv.addKeyword('customAsync', {
    async: true,
    modifying: true,
    compile: (schema, parentSchema, it) => {
      const schemaPath = it.schemaPath;
      const func: {
        <T extends string | number>(
          data: unknown,
          dataPath: string | undefined,
          parentData: Record<T, unknown> | undefined,
          propertyName: T | undefined
        ): Promise<boolean>;
      } = async (data, dataPath, parentData, propertyName) => {
        try {
          const value = await schema(data);
          if (parentData != null && propertyName != null) {
            parentData[propertyName] = value;
          }
          return true;
        } catch (err) {
          throw new ValidationError([
            {
              keyword: 'customSync',
              dataPath: dataPath ?? '',
              schemaPath,
              params: { message: err.message, stack: err.stack },
              schema,
              parentSchema,
              data,
            },
          ]);
        }
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return func as any;
    },
  });
}
