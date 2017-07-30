import { DynamoDB } from 'aws-sdk';

import { Table, ITable } from '../table';
import * as Metadata from '../metadata';

import * as Codec from '../codec';

export type RangeKeyOperation<T> = (
  { eq: T } |
  { lt: T } |
  { lte: T } |
  { gt: T } |
  { gte: T } |
  { beginsWith: T } |
  { between: T, and: T }
);

export class FullPrimaryKey<T extends Table, HashKeyType, RangeKeyType> {
  constructor(
    public tableClass: ITable<T>,
    public tableMetadata: Metadata.Table.Metadata,
    public metadata: Metadata.Indexes.FullPrimaryKeyMetadata,
    public documentClient: DynamoDB.DocumentClient
  ) {}

  async get(hashKey: HashKeyType, sortKey: RangeKeyType): Promise<T | null> {
    const dynamoRecord =
      await this.documentClient.get({
        TableName: this.tableMetadata.name,
        Key: {
          [this.metadata.hash.name]: hashKey,
          [this.metadata.range!.name]: sortKey,
        },
      }).promise();
    if (!dynamoRecord.Item) {
      return null;
    } else {
      return Codec.deserialize(this.tableClass, this.tableMetadata, dynamoRecord.Item)
    }
  }

  async batchGet(keys: Array<[HashKeyType, RangeKeyType]>) {
    // Todo check length of keys

    const res = await this.documentClient.batchGet({
      RequestItems: {
        [this.tableMetadata.name]: {
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
      records: res.Responses![this.tableMetadata.name].map(item => {
        return Codec.deserialize(this.tableClass, this.tableMetadata, item);
      })
    };
  }

  async query(options: {
    hash: HashKeyType,
    range: RangeKeyOperation<RangeKeyType>,
    limit?: number,
    exclusiveStartKey?: DynamoDB.DocumentClient.Key,
  }) {
    const range = options.range;

    const result =
      await this.documentClient.query({
        TableName: this.tableMetadata.name,
        Limit: options.limit,
        ScanIndexForward: true,
        ExclusiveStartKey: options.exclusiveStartKey,
        ReturnConsumedCapacity: "TOTAL",
        KeyConditionExpression: '#hk = :hkv AND #rk > :rkv',
        ExpressionAttributeNames:{
          "#hk": this.metadata.hash.name,
          "#rk": this.metadata.range!.name,
        },
        ExpressionAttributeValues: {
          ':hkv': options.hash,
          ':rkey': options.range,
        },
      }).promise();

    return {
      records: (result.Items || []).map(item => {
        return Codec.deserialize(this.tableClass, this.tableMetadata, item);
      }),
      count: result.Count,
      scannedCount: result.ScannedCount,
      LastEvaluatedKey: result.LastEvaluatedKey,
      ConsumedCapacity: result.ConsumedCapacity,
    };
  }
  // async scan()
  // batchGet(params: DocumentClient.BatchGetItemInput, callback?: (err: AWSError, data: DocumentClient.BatchGetItemOutput) => void): Request<DocumentClient.BatchGetItemOutput, AWSError>;
}
