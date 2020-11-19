import * as _ from "lodash";
import * as Metadata from "./metadata";
import { NumberSet, StringSet, Type } from "./metadata/attribute";
import * as Query from "./query";
import { Conditions } from "./query/expressions/conditions";

export class Table {
  // This will be setted by Decorator
  public static get metadata() {
    if (!(this as any).__metadata) {
      (this as any).__metadata = Metadata.Table.createMetadata();
    }
    return (this as any).__metadata as Metadata.Table.Metadata;
  }
  public static set metadata(metadata: Metadata.Table.Metadata) {
    (this as any).__metadata = metadata;
  }

  // Table Operations
  public static async createTable() {
    await Query.TableOperations.createTable(this.metadata);
  }
  public static async dropTable() {
    await Query.TableOperations.dropTable(this.metadata);
  }

  // raw storage for all attributes this record (instance) has
  private __attributes: { [key: string]: any } = {}; // tslint:disable-line

  private __writer: Query.Writer<Table>; // tslint:disable-line

  public getAttribute(name: string, metadata?: Metadata.Table.Metadata) {
    const value = this.__attributes[name];

    if (metadata && (value instanceof NumberSet || value instanceof StringSet)) {
      return metadata.connection.documentClient.createSet(value.toArray());
    }

    return value;
  }

  // Those are pretty much "Private". don't use it if its possible
  public setAttribute(name: string, value: any) {
    // Do validation with Attribute metadata maybe

    if (typeof(value) === "object") {
      const wrapperName = _.get(value, "wrapperName");
      const type = _.get(value, "type");

      if (wrapperName === "Set") {
        switch (type) {
          case "String":
            this.__attributes[name] = new StringSet(_.get(value, "values"));
            return;
          case "Number":
            this.__attributes[name] = new NumberSet(_.get(value, "values"));
            return;
        }
      }
    }

    this.__attributes[name] = value;
  }

  public setAttributes(attributes: { [name: string]: any }) {
    _.forEach(attributes, (value, name) => {
      this.setAttribute(name, value);
    });
  }
  private get writer() {
    if (!this.__writer) {
      this.__writer = new Query.Writer(this.constructor as ITable<Table>);
    }
    return this.__writer;
  }
  public async save<T extends Table>(
    this: T,
    options?: Partial<{
      condition?: Conditions<T> | Array<Conditions<T>>;
    }>,
  ) {
    return await this.writer.put(this, options);
  }
  public async delete<T extends Table>(
    this: T,
    options?: Partial<{
      condition?: Conditions<T> | Array<Conditions<T>>;
    }>,
  ) {
    return await this.writer.delete(this, options);
  }
  public serialize() {
    // TODO some serialization logic
    return this.__attributes;
  }
}

export interface ITable<T extends Table> {
  metadata: Metadata.Table.Metadata;
  new(): T;
}
