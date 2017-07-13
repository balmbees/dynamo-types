import {
  Table as TableMetadata,
  Attribute as AttributeMetadata,
} from '../metadata';


import { Table, ITable } from '../table';

// Deserialization means converting aws-sdk conprehensive "json" to TS Object
import { DynamoDB } from 'aws-sdk';

// Supported Native Types
type PrimitiveNativeTypes = (
  string// B
  | boolean // BOOL
  | string // S
  | null // NULL
  | number // N
);
type ComplexNativeTypes = (
  boolean[] // BS
  | PrimitiveNativeTypes[] // L
  | { [key: string]: NativeTypes } // M
  | number[] // NS
  | string[] // SS
);

export type NativeTypes = PrimitiveNativeTypes | ComplexNativeTypes;

// Move to table maybe
function __setAttribute<T extends Table>(record: T, attributeMetadata: AttributeMetadata.Metadata, value: NativeTypes) {
  // Ugly right? whatever..
  try {
    (record as any)[attributeMetadata.name] = value;
  } catch (e) {
    // 1. Value is invalid (type mismtach or error pasre)
    // 2. Setter doesn't exist
  }
}

import * as AttributeValue from './attribute_value';

export function deserialize<T extends Table>(
  tableClass: ITable<T>,
  tableMetadata: TableMetadata.Metadata,
  dynamoAttributes: DynamoDB.DocumentClient.AttributeMap
): T {
  const record = new tableClass();

  tableMetadata.attributes.forEach(attributeMetadata => {
    const attributeValue = dynamoAttributes[attributeMetadata.name] as NativeTypes;
    if (!attributeValue) {
      // attribute is defined but not provided by DynamoDB
      // raise error but maybe later?
      return;
    } else {
      __setAttribute(record, attributeMetadata, attributeValue);
    }
  });

  return record;
}
