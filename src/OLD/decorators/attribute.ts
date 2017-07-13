import { Table } from '../decorators/table';
import { TableMetadata } from '../metadata/table';
import { AttributeType } from '../metadata/attribute';

export function Attribute<T>(options: AttributeOptions) {
  return (object: object, propertyKey: string) => {
    const table = (object as any as Table);

    table.metadata.defineAttribute({
      name: options.name || propertyKey,
      type: options.type || Reflect.getMetadata("design:type", table, propertyKey),
    });
  }
}

export interface AttributeOptions {
  keyType?: "hash" | "range";
  name?: string;
  type?: AttributeType;
}
