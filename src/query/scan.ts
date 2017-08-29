export type Conditions<T> = (
  ["=", T]
  | ["<", T]
  | ["<=", T]
  | [">", T]
  | [">=", T]
  | ["!=", null]
  | ["=", null]
  | ["contains", string]
  | ["notContains", string]
  | ["beginsWith", T]
  | ["between", T, T]
  | ["in", T[]]
);
