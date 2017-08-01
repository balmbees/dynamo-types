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
  name: string;
  type: Type;
}

