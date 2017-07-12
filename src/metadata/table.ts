import { TableOptions } from '../decorators/table';
import { AttributeOptions } from '../decorators/attribute';

export class TableMetadata {
  constructor(
    private tableObject: object,
    private tableOptions: TableOptions
  ) {}

  get tableName() {
    return this.tableOptions.name;
  }

  defineAttribute(options: AttributeOptions) {
    const descriptor =
      Object.getOwnPropertyDescriptor(this.tableObject, options.name!) || {};

    descriptor.get = function() {
      return this[`_${options.name!}`];
    }
    descriptor.set = function(value) {
      this[`_${options.name!}`] = value;
    }

    Object.defineProperty(
      this.tableObject, options.name!, descriptor
    );
  }
}