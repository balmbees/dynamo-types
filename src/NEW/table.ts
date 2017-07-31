// Base Table
import * as Metadata from "./metadata";
import * as Query from "./query";

export class Table {
  // This will be setted by Decorator
  static metadata: Metadata.Table.Metadata = Metadata.Table.createMetadata();
}

export interface ITable<T extends Table> {
  metadata: Metadata.Table.Metadata;
  new(): T;
}
