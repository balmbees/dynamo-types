export type Conditions<T> = (
  ["=", T]
  | ["<", T]
  | ["<=", T]
  | [">", T]
  | [">=", T]
  | ["beginsWith", T]
  | ["between", T, T]
);

export function parseCondition<T>(condition: Conditions<T>, rangeKeyName: string) {
  switch (condition [0]) {
    case "=":
    case "<":
    case "<=":
    case ">":
    case ">=":
      return {
        conditionExpression: `${rangeKeyName} ${condition [0]} :rkv`,
        expressionAttributeValues: {
          ":rkv": condition [1],
        },
      };
    case "beginsWith":
      return {
        conditionExpression: `begins_with(${rangeKeyName}, :rkv)`,
        expressionAttributeValues: {
          ":rkv": condition [1],
        },
      };
    case "between":
      return {
        conditionExpression: `${rangeKeyName} between :rkv1 AND :rkv2`,
        expressionAttributeValues: {
          ":rkv1": condition [1],
          ":rkv2": condition [2],
        },
      };
  }
}
