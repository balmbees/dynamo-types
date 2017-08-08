import { DynamoDB } from 'aws-sdk';
import * as _ from 'lodash';

import { Table, ITable } from '../table';

import * as Metadata from '../metadata';
import * as Codec from '../codec';
import * as RangeKeyOperation from './range_key_operation';

import { batchWrite } from "./batch_write";

const HASH_KEY_REF = "#hk";
const HASH_VALUE_REF = ":hkv";

const RANGE_KEY_REF = "#rk";

export class FullPrimaryKey<T extends Table, HashKeyType, RangeKeyType> {
  constructor(
    readonly tableClass: ITable<T>,
    readonly metadata: Metadata.Indexes.FullPrimaryKeyMetadata,
    readonly documentClient: DynamoDB.DocumentClient
  ) {}

  async delete(hashKey: HashKeyType, sortKey: RangeKeyType) {
    const res = await this.documentClient.delete({
      TableName: this.tableClass.metadata.name,
      // ReturnValues: "ALL_OLD",
      Key: {
        [this.metadata.hash.name]: hashKey,
        [this.metadata.range.name]: sortKey,
      },
    }).promise();
  }

  async get(hashKey: HashKeyType, sortKey: RangeKeyType): Promise<T | null> {
    const dynamoRecord =
      await this.documentClient.get({
        TableName: this.tableClass.metadata.name,
        Key: {
          [this.metadata.hash.name]: hashKey,
          [this.metadata.range.name]: sortKey,
        },
      }).promise();
    if (!dynamoRecord.Item) {
      return null;
    } else {
      return Codec.deserialize(this.tableClass, dynamoRecord.Item)
    }
  }

  async batchGet(keys: Array<[HashKeyType, RangeKeyType]>) {
    // Todo check length of keys
    const res = await this.documentClient.batchGet({
      RequestItems: {
        [this.tableClass.metadata.name]: {
          Keys: keys.map((key) => {
            return {
              [this.metadata.hash.name]: key[0],
              [this.metadata.range.name]: key[1],
            }
          })
        }
      }
    }).promise();

    return {
      records: res.Responses![this.tableClass.metadata.name].map(item => {
        return Codec.deserialize(this.tableClass, item);
      })
    };
  }

  async batchDelete(keys: Array<[HashKeyType, RangeKeyType]>) {
    return await batchWrite(
      this.documentClient,
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
    range?: RangeKeyOperation.Operations<RangeKeyType>,
    rangeOrder?: "ASC" | "DESC",
    limit?: number,
    exclusiveStartKey?: DynamoDB.DocumentClient.Key,
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
    };

    if (options.range) {
      const rangeKeyOptions = RangeKeyOperation.parse(options.range, RANGE_KEY_REF);
      params.KeyConditionExpression += ` AND ${rangeKeyOptions.conditionExpression}`;
      Object.assign(params.ExpressionAttributeNames, { [RANGE_KEY_REF]: this.metadata.range.name });
      Object.assign(params.ExpressionAttributeValues, rangeKeyOptions.expressionAttributeValues);
    }

    const result = await this.documentClient.query(params).promise();

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

  // Let'just don't use Scan if it's possible
  // async scan()

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
      await this.documentClient.update({
        TableName: this.tableClass.metadata.name,
        Key: {
          [this.metadata.hash.name]: hashKey,
          [this.metadata.range.name]: sortKey,
        },
        AttributeUpdates: attributeUpdates,
      }).promise();
  }
}
