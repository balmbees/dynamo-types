import { DynamoDB } from "aws-sdk";

import * as Codec from "../codec";
import * as Metadata from "../metadata";
import { ITable, Table } from "../table";

import { batchGetFull, batchGetTrim } from "./batch_get";
import { batchWrite } from "./batch_write";

import { Conditions } from "./expressions/conditions";
import { buildCondition, buildUpdate } from "./expressions/transformers";
import { UpdateChanges } from "./expressions/update";

export class HashPrimaryKey<T extends Table, HashKeyType> {
  constructor(
    readonly tableClass: ITable<T>,
    readonly metadata: Metadata.Indexes.HashPrimaryKeyMetadata,
  ) {}

  public async delete(
    hashKey: HashKeyType,
    options: Partial<{
      condition: Conditions<T> | Array<Conditions<T>>;
    }> = {},
  ) {
    const res = await this.tableClass.metadata.connection.documentClient.delete({
      TableName: this.tableClass.metadata.name,
      Key: {
        [this.metadata.hash.name]: hashKey,
      },
      ...buildCondition(this.tableClass.metadata, options.condition),
    }).promise();
  }

  public async get(hashKey: HashKeyType, options: { consistent: boolean } = { consistent: false }): Promise<T | null> {
    const dynamoRecord =
      await this.tableClass.metadata.connection.documentClient.get({
        TableName: this.tableClass.metadata.name,
        Key: {
          [this.metadata.hash.name]: hashKey,
        },
        ConsistentRead: options.consistent,
      }).promise();
    if (!dynamoRecord.Item) {
      return null;
    } else {
      return Codec.deserialize(this.tableClass, dynamoRecord.Item);
    }
  }

  public async scan(options: {
    limit?: number,
    totalSegments?: number,
    segment?: number,
    exclusiveStartKey?: DynamoDB.DocumentClient.Key,
  } = {}) {
    const params: DynamoDB.DocumentClient.ScanInput = {
      TableName: this.tableClass.metadata.name,
      Limit: options.limit,
      ExclusiveStartKey: options.exclusiveStartKey,
      ReturnConsumedCapacity: "TOTAL",
      TotalSegments: options.totalSegments,
      Segment: options.segment,
    };

    const result = await this.tableClass.metadata.connection.documentClient.scan(params).promise();

    return {
      records: (result.Items || []).map((item) => {
        return Codec.deserialize(this.tableClass, item);
      }),
      count: result.Count,
      scannedCount: result.ScannedCount,
      lastEvaluatedKey: result.LastEvaluatedKey,
      consumedCapacity: result.ConsumedCapacity,
    };
  }

  public async batchGet(keys: HashKeyType[]) {
    const res = await batchGetTrim(
      this.tableClass.metadata.connection.documentClient,
      this.tableClass.metadata.name,
      keys.map((key) => {
        return {
          [this.metadata.hash.name]: key,
        };
      }),
    );

    return {
      records: res.map((item) => {
        return Codec.deserialize(this.tableClass, item);
      }),
    };
  }

  public async batchGetFull(keys: HashKeyType[]) {
    const res = await batchGetFull(
      this.tableClass.metadata.connection.documentClient,
      this.tableClass.metadata.name,
      keys.map((key) => {
        return {
          [this.metadata.hash.name]: key,
        };
      }),
    );

    return {
      records: res.map((item) => {
        return item ? Codec.deserialize(this.tableClass, item) : undefined;
      }),
    };
  }

  public async batchDelete(keys: HashKeyType[]) {
    return await batchWrite(
      this.tableClass.metadata.connection.documentClient,
      this.tableClass.metadata.name,
      keys.map((key) => {
        return {
          DeleteRequest: {
            Key: {
              [this.metadata.hash.name]: key,
            },
          },
        };
      }),
    );
  }

  // Let'just don't use Scan if it's possible
  // async scan()
  public async update(
    hashKey: HashKeyType,
    changes: Partial<UpdateChanges<T>>,
    options: Partial<{
      condition: Conditions<T> | Array<Conditions<T>>;
    }> = {},
  ): Promise<void> {
    const update = buildUpdate(this.tableClass.metadata, changes);
    const condition = buildCondition(this.tableClass.metadata, options.condition);

    const dynamoRecord =
      await this.tableClass.metadata.connection.documentClient.update({
        TableName: this.tableClass.metadata.name,
        Key: {
          [this.metadata.hash.name]: hashKey,
        },
        UpdateExpression: update.UpdateExpression,
        ConditionExpression: condition.ConditionExpression,
        ExpressionAttributeNames: { ...update.ExpressionAttributeNames, ...condition.ExpressionAttributeNames },
        ExpressionAttributeValues: { ...update.ExpressionAttributeValues, ...condition.ExpressionAttributeValues },
      }).promise();
  }
}
