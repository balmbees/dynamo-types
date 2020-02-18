import { Operator } from "./operator";

export type Conditions<T> = {
  // Currently Operator usage is forced.
  // [P in keyof T]?: Conditions<T[P]>|Operator<Conditions<T[P]>>;
  [P in keyof T]?: Operator<Conditions<T[P]>>;
};
