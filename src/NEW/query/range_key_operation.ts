export type Operations<T> = (
  ["=", T]
  | ["<", T]
  | ["<=", T]
  | [">", T]
  | [">=", T]
  | ["beginsWith", T]
  | ["between", T, T]
);

export function parse<T>(operation: Operations<T>, rangeKeyName: string) {
  switch (operation[0]) {
    case "=":
    case "<":
    case "<=":
    case ">":
    case ">=":
      return {
        conditionExpression: `${rangeKeyName} ${operation[0]} :rkv`,
        expressionAttributeValues: {
          ':rkv': operation[1],
        },
      };
    case "beginsWith":
      return {
        conditionExpression: `begins_with(${rangeKeyName}, :rkv)`,
        expressionAttributeValues: {
          ':rkv': operation[1],
        },
      };
    case "between":
      return {
        conditionExpression: `${rangeKeyName} between :rkv1 AND :rkv2`,
        expressionAttributeValues: {
          ':rkv1': operation[1],
          ':rkv2': operation[2],
        },
      };
  }
}