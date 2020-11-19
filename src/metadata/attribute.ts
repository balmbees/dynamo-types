export const enum Type {
  Buffer = "B",
  Boolean = "BOOL",
  String = "S",
  Null = "NULL",
  Number = "N",
  // BooleanArray = "BS",
  // NumberArray = "NS",
  // StringArray = "SS",
  Array = "L",
  Map = "M",
  StringSet = "SS",
  NumberSet = "NS",
}

export class StringSet extends Set<string> {
  public toJSON() {
    return {
      [Type.StringSet]: Array.from(this)
    };
  }

  public toArray() {
    return Array.from(this);
  }
}
// tslint:disable-next-line: max-classes-per-file
export class NumberSet extends Set<number> {
  public toJSON() {
    return {
      [Type.NumberSet]: Array.from(this).map((value) => value.toString())
    };
  }

  public toArray() {
    return Array.from(this);
  }
}

export interface Metadata {
  name: string; // Name on DynamoDB
  propertyName: string; // Mapped property name on TS Object
  timeToLive: true | undefined;
  type: Type;
}
