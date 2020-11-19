import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { Config, Table } from ".";
import { Connection } from "./connections";
import { Conditions } from "./query";

export class TransactionWrite {
  private __connection: Connection;
  private __typedOperation: Array<{
    type: "put",
    operation: DocumentClient.Put
  } | {
    type: "update",
    operation: DocumentClient.Update
  } | {
    type: "delete",
    operation: DocumentClient.Delete
  }>;

  constructor(
    connection?: Connection,
  ) {
    this.__connection = connection ?? Config.default.defaultConnection;
    this.__typedOperation = [];
  }

  public put(operation: DocumentClient.Put) {
    this.__typedOperation.push({
      type: "put",
      operation
    });
  }

  public update(operation: DocumentClient.Update) {
    this.__typedOperation.push({
      type: "update",
      operation
    });
  }

  public delete(operation: DocumentClient.Delete) {
    this.__typedOperation.push({
      type: "delete",
      operation
    });
  }

  public async commit() {

    const items = this.__typedOperation.map((item) => {
      if (item.type === "put") {
        return {
          Put: item.operation
        };
      } else if (item.type === "update") {
        return {
          Update: item.operation
        };
      } else {
        return {
          Delete: item.operation
        };
      }
    });

    try {
      await this.__connection.documentClient.transactWrite({
        TransactItems: items
      }).promise();
    } catch (e) {
      // tslint:disable-next-line: no-console
      console.log(e);
      throw e;
    }

  }
}
