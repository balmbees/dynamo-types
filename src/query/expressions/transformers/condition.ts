import * as Metadata from "../../../metadata";
import { Conditions, Operator } from "../conditions";

const CONDITION_NAME_REF_PREFIX = "#ck";
const CONDITION_VALUE_REF_PREFIX = ":cv";

export function buildCondition<T>(
  metadata: Metadata.Table.Metadata,
  condition: Conditions<T> | Array<Conditions<T>> = []
): Partial<{
  ConditionExpression: string;
  ExpressionAttributeNames: { [key: string]: string };
  ExpressionAttributeValues: { [key: string]: any };
}> {
  const conditions: Array<Conditions<T>> = Array.isArray(condition) ? condition : [condition];
  if (conditions.length === 0) {
    return {};
  }

  const conditionExpressions: string[] = [];
  const keyRef = new Map<string, string>();
  const valueRef = new Map<string, string>();

  const keyNameCache = new Map<string, string>(metadata.attributes.map((attr) => [attr.propertyName, attr.name]));

  for (const cond of conditions) {
    const operatorExpressions: string[] = [];

    for (const [key, op] of Object.entries(cond) as Array<[string, Operator<any>]>) {
      const name = keyNameCache.get(key);

      if (name) {
        const keyPath = `${CONDITION_NAME_REF_PREFIX}${keyRef.size}`;
        keyRef.set(keyPath, name);

        if (op.useValue) {
          const values: any[] = Array.isArray(op.value) ? op.value : [ op.value ];
          const valuePaths = values.map((value) => {
            const valuePath = `${CONDITION_VALUE_REF_PREFIX}${valueRef.size}`;
            valueRef.set(valuePath, value);
            return valuePath;
          });

          operatorExpressions.push(op.toExpression(keyPath, valuePaths));
        } else {
          operatorExpressions.push(op.toExpression(keyPath, []));
        }
      }
    }

    conditionExpressions.push(operatorExpressions.join(" AND "));
  }

  return {
    ConditionExpression: conditionExpressions.map((expr) => `( ${expr} )`).join(" OR "),
    ExpressionAttributeNames: keyRef.size > 0 ?
      Array.from(keyRef.entries()).reduce((hash, [key, val]) => ({
        ...hash,
        [key]: val,
      }), {}) :
      undefined,
    ExpressionAttributeValues: valueRef.size > 0 ?
      Array.from(valueRef.entries()).reduce((hash, [key, val]) => ({
        ...hash,
        [key]: val,
      }), {}) :
      undefined,
  };
}
