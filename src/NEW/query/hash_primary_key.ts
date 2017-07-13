import { DynamoDB } from 'aws-sdk';

import { Table, ITable } from '../table';
import * as Metadata from '../metadata';

import * as Codec from '../codec';

import { client } from '../dynamo-client';

export class HashPrimaryKey<T extends Table, HashKeyType> {
    constructor(
    public tableClass: ITable<T>,
    public tableMetadata: Metadata.Table.Metadata,
    public metadata: Metadata.Indexes.HashPrimaryKeyMetadata,
  ) {}

  async get(hashKey: HashKeyType): Promise<T | null> {
    const dynamoRecord =
      await client.get({
        TableName: this.tableMetadata.name,
        Key: {
          [this.metadata.hash.name]: hashKey,
        },
      }).promise();
    if (!dynamoRecord.Item) {
      return null;
    } else {
      return Codec.deserialize(this.tableClass, this.tableMetadata, dynamoRecord.Item)
    }
  }

  async query(options: {
    hash: HashKeyType,
    limit?: number,
    exclusiveStartKey?: DynamoDB.DocumentClient.Key,
  }) {
    const result =
      await client.query({
        TableName: this.tableMetadata.name,
        Limit: options.limit,
        ScanIndexForward: true,
        ExclusiveStartKey: options.exclusiveStartKey,
        ReturnConsumedCapacity: "TOTAL",
        KeyConditionExpression: '#hk = :hkv',
        ExpressionAttributeNames:{
          "#hk": this.metadata.hash.name,
        },
        ExpressionAttributeValues: {
          ':hkv': options.hash,
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
}