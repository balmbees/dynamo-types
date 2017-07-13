type PrimitiveAttributeType = (
  Buffer// B
  | boolean // BOOL
  | string // S
  | null // NULL
  | number // N
);
type ComplexAttributeType = (
  boolean[] // BS
  | PrimitiveAttributeType[] // L
  | { [key: string]: AttributeType } // M
  | number[] // NS
  | string[] // SS
);

export type AttributeType = PrimitiveAttributeType | ComplexAttributeType;
export interface AttributeMetadata {
  keyType?: "hash" | "range";
  name: string;
  type: AttributeType;
}
