import { TableOptions } from '../decorators/table';
import { AttributeMetadata } from '../metadata/attribute';

export interface TableIndexMetadata {
  hashKey: AttributeMetadata;
  rangeKey?: AttributeMetadata;
}

export class TableMetadata {
  constructor(
    private tableObject: object,
    private tableOptions: TableOptions
  ) {}

  get tableName() {
    return this.tableOptions.name;
  }

  private attributes: { [name: string]: AttributeMetadata } = {};
  private defaultIndex: TableIndexMetadata;

  defineAttribute(options: AttributeMetadata) {
    // Define getter and setters for given attribute
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

    // Save attribute metadata
    this.attributes[options.name] = options;
  }
}