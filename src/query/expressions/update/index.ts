import { NumberSet, StringSet } from "../../../metadata/attribute";

// TODO: Implement own Action classes
export type UpdateAction = UpdateActionNormal | UpdateActionList | UpdateActionRemove;

export type UpdateActionNormal = "PUT" | "DELETE" | "ADD";
export type UpdateActionList = "APPEND";
export type UpdateActionRemove = "REMOVE";

export type UpdateChanges<T> = {
  [P in keyof T]?: [
    UpdateActionNormal,
    T[P]
  ] | [
    UpdateActionList,
    T[P] extends Array<infer E> ? T[P] : never
  ] | [
    UpdateActionRemove
  ]
};
