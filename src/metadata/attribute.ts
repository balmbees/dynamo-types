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
}

export interface Metadata {
  name: string; // Name on DynamoDB
  propertyName: string; // Mapped property name on TS Object
  timeToLive: true | undefined;
  type: Type;
}
