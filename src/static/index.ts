import { Table } from '../decorators/table';
import { TableMetadata } from '../metadata/table';

import * as AWS from "aws-sdk";

type Item = AWS.DynamoDB.AttributeMap;

// All the methods of this will be implemented in @Table. (or With the help of @Attribute)
export interface TableStaticClass<TableClass> {
  // Interface Provider
  new(item: Item): TableClass;
}

export class StaticHelper<Table> {
  private documentClient: AWS.DynamoDB.DocumentClient;

  constructor(
    private table: TableStaticClass<Table>
  ) {
    this.documentClient = new AWS.DynamoDB.DocumentClient();
  }

  private get tableMetadata(): TableMetadata {
    // Force access.
    return (this.table as any).metadata as TableMetadata;
  }

  fromItem(item: Item) {
    return new this.table(item);
  }
  fromItems(items: Item[]) {
    return items.map(item => this.fromItem(item));
  }

  async scan(options: { Limit?: number }) {
    const res =
      await this.documentClient
        .scan({
          TableName: this.tableMetadata.tableName,
          Limit: options.Limit,
        })
        .promise();
    return this.fromItems(res.Items || []);
  }

  async batchGet(keyList: AWS.DynamoDB.KeyList) {
    const res = await this.documentClient
                  .batchGet({
                    RequestItems: {
                      [this.tableMetadata.tableName]: {
                        Keys: keyList,
                      }
                    }
                  })
                  .promise();

    return this.fromItems((res.Responses || {})[this.tableMetadata.tableName] || []);
  }

  async batchPut(items: Item[]) {
    const res = await this.documentClient
                  .batchWrite({
                    RequestItems: {
                      [this.tableMetadata.tableName]: items.map(item => {
                        return {
                          PutRequest: {
                            Item: item,
                          }
                        };
                      }),
                    }
                  })
                  .promise();

    return this.fromItems(items);

  }

  async put(item: Item) {
    const res = await this.documentClient
                  .put({
                    TableName: this.tableMetadata.tableName,
                    Item: item,
                  })
                  .promise();

    return this.fromItem(res.Attributes || []);
  }
}
