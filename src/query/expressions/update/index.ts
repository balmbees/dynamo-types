// TODO: Implement own Action classes

export type UpdateAction = "ADD" | "PUT" | "DELETE";

export type UpdateChanges<T> = {
  [P in keyof T]?: [
    UpdateAction,
    T[P]
  ]
};
