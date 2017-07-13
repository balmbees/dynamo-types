import * as Attribute from './attribute';
import * as Indexes from './indexes';

// Table consists of
// - Attributes
// - Indexes

export interface Metadata {
  name: string; // name of the table
  attributes: Attribute.Metadata[]; // List of attributes this table has
  // indexes: IndexMetadata[]; // List of Indexes this table has

  // Default Index, which every table must have
  primaryKey: (
    Indexes.FullPrimaryKeyMetadata
   | Indexes.HashPrimaryKeyMetadata
  );
}
