import { Table } from '../decorators/table';
import { TableMetadata } from '../metadata/table';

export function Attribute<T>(
  options: {
    keyType?: "hash" | "range",
    name?: string,
    type?: Function,
    globalSecondaryIndex?: GlobalSecondaryIndexDefinition[],
  })
{
  return (table: Table, propertyKey: string) => {
    options.name = options.name || propertyKey;
    options.type = options.type || Reflect.getMetadata("design:type", table, propertyKey);

    table.metadata.defineAttribute(options);
  }
}

export interface AttributeOptions {
  keyType?: "hash" | "range",
  name?: string,
  type?: Function,
  globalSecondaryIndex?: GlobalSecondaryIndexDefinition[],
}

export interface GlobalSecondaryIndexDefinition {

}
