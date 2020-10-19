import { Ajv, ValidationError, ErrorObject } from 'ajv';

export default function CustomKeywords(ajv: Ajv): void {
  ajv.addKeyword('errorMessage', { valid: true });
  ajv.addKeyword('stripNull', {
    async: false,
    modifying: true,
    metaSchema: { type: 'boolean' },
    statements: true,
    inline: (it, _keyword, schema) => {
      const result = `valid${it.level}`;
      if (!schema || it.dataLevel === 0) {
        return `var ${result} = true;`;
      }
      const value = `data${it.dataLevel}`;
      const valueInParent = `data${it.dataLevel - 1 || ''}[${it.dataPathArr[it.dataLevel]}]`;
      return `if (${value} === null) { ${value} = ${valueInParent} = undefined; } var ${result} = true;`;
    },
  });
  ajv.addKeyword('customSync', {
    async: false,
    modifying: true,
    compile: (schema, parentSchema, it) => {
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
              schemaPath: it.schemaPath,
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
              schemaPath: it.schemaPath,
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
