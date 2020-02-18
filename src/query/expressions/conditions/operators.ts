import { Operator } from "./operator";

export function Equal<T>(value: T) {
  return new Operator("equal", value);
}

export function NotEqual<T>(value: T) {
  return new Operator("notEqual", value);
}

export function LessThan<T>(value: T) {
  return new Operator("lessThan", value);
}

export function LessThanOrEqual<T>(value: T) {
  return new Operator("lessThanOrEqual", value);
}

export function GreaterThan<T>(value: T) {
  return new Operator("greaterThan", value);
}

export function GreaterThanOrEqual<T>(value: T) {
  return new Operator("greaterThanOrEqual", value);
}

export function Between<T>(from: T, to: T) {
  return new Operator("between", [from, to] as any);
}

export function In<T>(value: T[]) {
  return new Operator("in", value as any);
}

export function AttributeExists() {
  return new Operator("attributeExists", undefined as any, false);
}

export function AttributeNotExists() {
  return new Operator("attributeNotExists", undefined as any, false);
}

export function BeginsWith<T>(value: T) {
  return new Operator("beginsWith", value);
}

export function Contains<T>(value: T) {
  return new Operator("contains", value);
}
