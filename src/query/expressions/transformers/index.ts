export * from "./condition";
export * from "./update";

interface Expression {
  ConditionExpression: string;
  UpdateExpression: string;
  ExpressionAttributeNames: { [key: string]: string };
  ExpressionAttributeValues: { [key: string]: any };
}
