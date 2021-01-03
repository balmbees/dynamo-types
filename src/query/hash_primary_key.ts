import { DynamoDB } from "aws-sdk";

import * as _ from "lodash";
import { TransactionWrite } from "..";
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

  public buildDeleteOperation(
    hashKey: HashKeyType,
    options: Partial<{
      condition: Conditions<T> | Array<Conditions<T>>;
    }> = {},
  ) {
    return {
      TableName: this.tableClass.metadata.name,
      Key: {
        [this.metadata.hash.name]: hashKey,
      },
      ...buildCondition(this.tableClass.metadata, options.condition),
    };
  }

  public async delete(
    hashKey: HashKeyType,
    options: Partial<{
      condition: Conditions<T> | Array<Conditions<T>>;
    }> = {},
  ) {
    await this.tableClass.metadata.connection.documentClient.delete(
      this.buildDeleteOperation(hashKey, options)
    ).promise();
  }

  public transactionDelete(
    transaction: TransactionWrite,
    hashKey: HashKeyType,
    options: Partial<{
      condition: Conditions<T> | Array<Conditions<T>>;
    }> = {},
  ) {
    const operation = this.buildDeleteOperation(hashKey, options);
    transaction.delete(operation);

    return transaction;
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

  public buildUpdateOperation(
    hashKey: HashKeyType,
    changes: Partial<UpdateChanges<T>>,
    options: Partial<{
      condition: Conditions<T> | Array<Conditions<T>>;
    }> = {},
  ) {
    const update = buildUpdate(this.tableClass.metadata, changes);
    const condition = buildCondition(this.tableClass.metadata, options.condition);

    const attributeNames = { ...update.ExpressionAttributeNames, ...condition.ExpressionAttributeNames };
    const attributeValues = { ...update.ExpressionAttributeValues, ...condition.ExpressionAttributeValues };

    return {
      TableName: this.tableClass.metadata.name,
      Key: {
        [this.metadata.hash.name]: hashKey,
      },
      UpdateExpression: update.UpdateExpression,
      ConditionExpression: condition.ConditionExpression,
      ExpressionAttributeNames: _.isEmpty(attributeNames) ? undefined : attributeNames,
      ExpressionAttributeValues: _.isEmpty(attributeValues) ? undefined : attributeValues,
    };
  }

  public async update(
    hashKey: HashKeyType,
    changes: Partial<UpdateChanges<T>>,
    options: Partial<{
      condition: Conditions<T> | Array<Conditions<T>>;
    }> = {},
  ): Promise<void> {

    await this.tableClass.metadata.connection.documentClient.update(
      this.buildUpdateOperation(hashKey, changes, options)
    ).promise();
  }

  public async transactionUpdate(
    transaction: TransactionWrite,
    hashKey: HashKeyType,
    changes: Partial<UpdateChanges<T>>,
    options: Partial<{
      condition: Conditions<T> | Array<Conditions<T>>;
    }> = {},
  ) {
    const operation = this.buildUpdateOperation(hashKey, changes, options);

    transaction.update(operation);
    return transaction;
  }

}
