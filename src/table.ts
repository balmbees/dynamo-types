// Base Table
import * as Metadata from "./metadata";
import * as Query from "./query";

import * as _ from "lodash";

export class Table {
  // This will be setted by Decorator
  static metadata: Metadata.Table.Metadata = Metadata.Table.createMetadata();

  // raw storage for all attributes this record (instance) has
  private __attributes: { [key: string]: any } = {};

  // Those are pretty much "Private". don't use it if its possible
  setAttribute(name: string, value: any) {
    // Do validation with Attribute metadata maybe
    this.__attributes[name] = value;
  }
  getAttribute(name: string) {
    return this.__attributes[name];
  }
  setAttributes(attributes: { [name: string]: any }) {
    _.forEach(attributes, (value, name) => {
      this.setAttribute(name, value);
    });
  }

  serialize() {
    // TODO some serialization logic
    return this.__attributes;
  }
}

export interface ITable<T extends Table> {
  metadata: Metadata.Table.Metadata;
  new(): T;
}
