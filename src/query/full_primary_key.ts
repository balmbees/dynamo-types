import { DynamoDB } from 'aws-sdk';

import { Table, ITable } from '../table';
import * as Metadata from '../metadata';

import * as Codec from '../codec';

import * as RangeKeyOperation from './range_key_operation';

const HASH_KEY_REF = "#hk";
const HASH_VALUE_REF = ":hkv";

const RANGE_KEY_REF = "#rk";

export class FullPrimaryKey<T extends Table, HashKeyType, RangeKeyType> {
  constructor(
    readonly tableClass: ITable<T>,
    readonly metadata: Metadata.Indexes.FullPrimaryKeyMetadata,
    readonly documentClient: DynamoDB.DocumentClient
  ) {}

  async get(hashKey: HashKeyType, sortKey: RangeKeyType): Promise<T | null> {
    const dynamoRecord =
      await this.documentClient.get({
        TableName: this.tableClass.metadata.name,
        Key: {
          [this.metadata.hash.name]: hashKey,
          [this.metadata.range!.name]: sortKey,
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

  async query(options: {
    hash: HashKeyType,
    range?: RangeKeyOperation.Operations<RangeKeyType>,
    limit?: number,
    exclusiveStartKey?: DynamoDB.DocumentClient.Key,
  }) {
    const params: DynamoDB.DocumentClient.QueryInput = {
      TableName: this.tableClass.metadata.name,
      Limit: options.limit,
      ScanIndexForward: true,
      ExclusiveStartKey: options.exclusiveStartKey,
      ReturnConsumedCapacity: "TOTAL",
      KeyConditionExpression: `${HASH_KEY_REF} = ${HASH_VALUE_REF}`,
      ExpressionAttributeNames: {
        [HASH_KEY_REF]: this.metadata.hash.name,
        [RANGE_KEY_REF]: this.metadata.range.name,
      },
      ExpressionAttributeValues: {
        [HASH_VALUE_REF]: options.hash,
      },
    };

    if (options.range) {
      const rangeKeyOptions = RangeKeyOperation.parse(options.range, RANGE_KEY_REF);
      params.KeyConditionExpression += ` AND ${rangeKeyOptions.conditionExpression}`;
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
}