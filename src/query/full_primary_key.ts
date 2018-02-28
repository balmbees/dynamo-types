import { DynamoDB } from 'aws-sdk';
import * as _ from 'lodash';

import { Table, ITable } from '../table';

import * as Metadata from '../metadata';
import * as Codec from '../codec';
import * as Query from './query';

import { batchWrite } from "./batch_write";
import { batchGetFull, batchGetTrim } from "./batch_get";

const HASH_KEY_REF = "#hk";
const HASH_VALUE_REF = ":hkv";

const RANGE_KEY_REF = "#rk";

export class FullPrimaryKey<T extends Table, HashKeyType, RangeKeyType> {
  constructor(
    readonly tableClass: ITable<T>,
    readonly metadata: Metadata.Indexes.FullPrimaryKeyMetadata
  ) {}

  async delete(hashKey: HashKeyType, sortKey: RangeKeyType) {
    const res = await this.tableClass.metadata.connection.documentClient.delete({
      TableName: this.tableClass.metadata.name,
      // ReturnValues: "ALL_OLD",
      Key: {
        [this.metadata.hash.name]: hashKey,
        [this.metadata.range.name]: sortKey,
      },
    }).promise();
  }

  /**
   * @param hashKey - HashKey
   * @param sortKey - sortKey
   * @param options - read options. consistent means "strongly consistent" or not
   */
  async get(hashKey: HashKeyType, sortKey: RangeKeyType, options: { consistent: boolean } = { consistent: false } ): Promise<T | null> {
    const dynamoRecord =
      await this.tableClass.metadata.connection.documentClient.get({
        TableName: this.tableClass.metadata.name,
        Key: {
          [this.metadata.hash.name]: hashKey,
          [this.metadata.range.name]: sortKey,
        },
        ConsistentRead: options.consistent,
      }).promise();
    if (!dynamoRecord.Item) {
      return null;
    } else {
      return Codec.deserialize(this.tableClass, dynamoRecord.Item)
    }
  }

  async batchGet(keys: Array<[HashKeyType, RangeKeyType]>) {
    const res = await batchGetTrim(
      this.tableClass.metadata.connection.documentClient,
      this.tableClass.metadata.name,
      keys.map((key) => {
        return {
          [this.metadata.hash.name]: key[0],
          [this.metadata.range.name]: key[1],
        }
      })
    );

    return {
      records: res.map(item => {
        return Codec.deserialize(this.tableClass, item);
      })
    };
  }

  async batchGetFull(keys: Array<[HashKeyType, RangeKeyType]>) {
    const res = await batchGetFull(
      this.tableClass.metadata.connection.documentClient,
      this.tableClass.metadata.name,
      keys.map((key) => {
        return {
          [this.metadata.hash.name]: key[0],
          [this.metadata.range.name]: key[1],
        }
      })
    );

    return {
      records: res.map(item => {
        return item ? Codec.deserialize(this.tableClass, item) : undefined;
      })
    };
  }

  async batchDelete(keys: Array<[HashKeyType, RangeKeyType]>) {
    return await batchWrite(
      this.tableClass.metadata.connection.documentClient,
      this.tableClass.metadata.name,
      keys.map(key => {
        return {
          DeleteRequest: {
            Key: {
              [this.metadata.hash.name]: key[0],
              [this.metadata.range.name]: key[1],
            },
          },
        };
      })
    );
  }

  async query(options: {
    hash: HashKeyType,
    range?: Query.Conditions<RangeKeyType>,
    rangeOrder?: "ASC" | "DESC",
    limit?: number,
    exclusiveStartKey?: DynamoDB.DocumentClient.Key,
    consistent?: boolean,
  }) {
    if (!options.rangeOrder) {
      options.rangeOrder = "ASC";
    }
    const ScanIndexForward = options.rangeOrder === "ASC"

    const params: DynamoDB.DocumentClient.QueryInput = {
      TableName: this.tableClass.metadata.name,
      Limit: options.limit,
      ScanIndexForward: ScanIndexForward,
      ExclusiveStartKey: options.exclusiveStartKey,
      ReturnConsumedCapacity: "TOTAL",
      KeyConditionExpression: `${HASH_KEY_REF} = ${HASH_VALUE_REF}`,
      ExpressionAttributeNames: {
        [HASH_KEY_REF]: this.metadata.hash.name,
      },
      ExpressionAttributeValues: {
        [HASH_VALUE_REF]: options.hash,
      },
      ConsistentRead: options.consistent
    };

    if (options.range) {
      const rangeKeyOptions = Query.parseCondition(options.range, RANGE_KEY_REF);
      params.KeyConditionExpression += ` AND ${rangeKeyOptions.conditionExpression}`;
      Object.assign(params.ExpressionAttributeNames, { [RANGE_KEY_REF]: this.metadata.range.name });
      Object.assign(params.ExpressionAttributeValues, rangeKeyOptions.expressionAttributeValues);
    }

    const result = await this.tableClass.metadata.connection.documentClient.query(params).promise();

    return {
      records: (result.Items || []).map(item => {
        return Codec.deserialize(this.tableClass, item);
      }),
      count: result.Count,
      scannedCount: result.ScannedCount,
      lastEvaluatedKey: result.LastEvaluatedKey,
      consumedCapacity: result.ConsumedCapacity,
    };
  }

  async scan(options: {
    limit?: number,
    totalSegments?: number,
    segment?: number,
    FilterExpression?: string,
    exclusiveStartKey?: DynamoDB.DocumentClient.Key,
  }) {
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
      records: (result.Items || []).map(item => {
        return Codec.deserialize(this.tableClass, item);
      }),
      count: result.Count,
      scannedCount: result.ScannedCount,
      lastEvaluatedKey: result.LastEvaluatedKey,
      consumedCapacity: result.ConsumedCapacity,
    };
  }

  async update(
    hashKey: HashKeyType,
    sortKey: RangeKeyType,
    changes: {
      [key: string]: [
        DynamoDB.DocumentClient.AttributeAction,
        any
      ],
    },
  ): Promise<void> {
    let attributeUpdates: DynamoDB.DocumentClient.AttributeUpdates = {};

    this.tableClass.metadata.attributes.forEach(attr => {
      const change = changes[attr.propertyName];
      if (change) {
        attributeUpdates[attr.name] = {
          Action: change[0],
          Value: change[1],
        };
      }
    });

    const dynamoRecord =
      await this.tableClass.metadata.connection.documentClient.update({
        TableName: this.tableClass.metadata.name,
        Key: {
          [this.metadata.hash.name]: hashKey,
          [this.metadata.range.name]: sortKey,
        },
        AttributeUpdates: attributeUpdates,
      }).promise();
  }
}
