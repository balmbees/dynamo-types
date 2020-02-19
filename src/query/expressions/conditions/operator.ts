// TODO: Implement "Not" operator

export type OperatorType = "equal"
  | "notEqual"
  | "lessThan"
  | "lessThanOrEqual"
  | "greaterThan"
  | "greaterThanOrEqual"
  | "between"
  | "in"
  | "attributeExists"
  | "attributeNotExists"
  | "beginsWith"
  | "contains";

export class Operator<T> {
  // tslint:disable:variable-name
  private readonly _type: OperatorType;
  private readonly _value: T | Operator<T>;
  private readonly _useValue: boolean;
  // tslint:enable:variable-name

  public constructor(
    type: OperatorType,
    value: T | Operator<T>,
    useValue: boolean = true,
  ) {
    this._type = type;
    this._value = value;
    this._useValue = useValue;
  }

  public get value(): T {
    return this._value instanceof Operator ?
      this._value.value :
      this._value;
  }

  public get useValue() {
    return this._useValue;
  }

  public toExpression(keyPath: string, valuePaths: string[]): string {
    switch (this._type) {
      case "equal":
        return `${keyPath} = ${valuePaths[0]}`;
      case "notEqual":
        return `${keyPath} <> ${valuePaths[0]}`;
      case "lessThan":
        return `${keyPath} < ${valuePaths[0]}`;
      case "lessThanOrEqual":
        return `${keyPath} <= ${valuePaths[0]}`;
      case "greaterThan":
        return `${keyPath} > ${valuePaths[0]}`;
      case "greaterThanOrEqual":
        return `${keyPath} >= ${valuePaths[0]}`;
      case "between":
        return `${keyPath} BETWEEN ${valuePaths[0]} AND ${valuePaths[1]}`;
      case "in":
        return `${keyPath} IN (${valuePaths.map((path) => `${path}`).join(", ")})`;
      case "attributeExists":
        return `attribute_exists(${keyPath})`;
      case "attributeNotExists":
        return `attribute_not_exists(${keyPath})`;
      case "beginsWith":
        return `begins_with(${keyPath}, ${valuePaths[0]})`;
      case "contains":
        return `contains(${keyPath}, ${valuePaths[0]})`;
    }
  }
}
