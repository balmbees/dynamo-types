// Base Table
import * as Metadata from "./metadata";
import * as Query from "./query";

import * as _ from "lodash";
import Config from './config';

export class Table {
  // This will be setted by Decorator
  static metadata: Metadata.Table.Metadata = Metadata.Table.createMetadata();

  // Table Operations
  static async createTable() {
    await Query.TableOperations.createTable(this.metadata, Config.client);
  }
  static async dropTable() {
    await Query.TableOperations.dropTable(this.metadata, Config.client);
  }

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

  private __writer: Query.Writer<Table>;
  private get writer() {
    if (!this.__writer) {
      this.__writer = new Query.Writer(
        (this.constructor as ITable<Table>),
        Config.documentClient
      );
    }
    return this.__writer;
  }
  public async save() {
    return await this.writer.put(this);
  }
  public async delete() {
    return await this.writer.delete(this);
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
