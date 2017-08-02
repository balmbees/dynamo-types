import * as Attribute from './attribute';
import * as Indexes from './indexes';

// Table consists of
// - Attributes
// - Indexes

export interface Metadata {
  name: string; // name of the table on DynamoDB
  attributes: Attribute.Metadata[]; // List of attributes this table has
  // indexes: IndexMetadata[]; // List of Indexes this table has

  // Default Index, which every table must have
  primaryKey: (
    Indexes.FullPrimaryKeyMetadata
   | Indexes.HashPrimaryKeyMetadata
  );
}

export function createMetadata() {
  return {
    name: "",
    attributes: [],
  } as any as Metadata;
}

export function validateMetadata(metadata: Metadata) {
  if (!metadata.name)
    throw new Error("Name must be proviede for Table");
  if (!metadata.primaryKey)
    throw new Error("Table must have PrimaryKey");
}
