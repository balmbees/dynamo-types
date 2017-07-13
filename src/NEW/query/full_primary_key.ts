import { DynamoDB } from 'aws-sdk';

import { Table, ITable } from '../table';
import * as Metadata from '../metadata';

import * as Codec from '../codec';

import { client } from '../dynamo-client';

export type RangeKeyOperation<T> = (
  { eq: T } |
  { lt: T } |
  { lte: T } |
  { gt: T } |
  { gte: T } |
  { beginsWith: T } |
  { between: T, and: T }
);

export class FullPrimaryKey<T extends Table, HashKeyType, SortKeyType> {
  constructor(
    public tableClass: ITable<T>,
    public tableMetadata: Metadata.Table.Metadata,
    public metadata: Metadata.Indexes.FullPrimaryKeyMetadata
  ) {}

  async get(hashKey: HashKeyType, sortKey: SortKeyType): Promise<T | null> {
    const dynamoRecord =
      await client.get({
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

  async query(options: {
    hash: HashKeyType,
    range: RangeKeyOperation<SortKeyType>,
    limit?: number,
    exclusiveStartKey?: DynamoDB.DocumentClient.Key,
  }) {
    const range = options.range;

    const result =
      await client.query({
        TableName: this.tableMetadata.name,
        // IndexName?: IndexName;
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
  // /**
  //  * Returns the attributes of one or more items from one or more tables by delegating to AWS.DynamoDB.batchGetItem().
  //  */
  // batchGet(params: DocumentClient.BatchGetItemInput, callback?: (err: AWSError, data: DocumentClient.BatchGetItemOutput) => void): Request<DocumentClient.BatchGetItemOutput, AWSError>;
}


// async update()
// /**
//  * Edits an existing item's attributes, or adds a new item to the table if it does not already exist by delegating to AWS.DynamoDB.updateItem().
//  */
// update(params: DocumentClient.UpdateItemInput, callback?: (err: AWSError, data: DocumentClient.UpdateItemOutput) => void): Request<DocumentClient.UpdateItemOutput, AWSError>;
// at data writing, you can just use model, and that's all

// /**
//  * Deletes a single item in a table by primary key by delegating to AWS.DynamoDB.deleteItem().
//  */
// delete(params: DocumentClient.DeleteItemInput, callback?: (err: AWSError, data: DocumentClient.DeleteItemOutput) => void): Request<DocumentClient.DeleteItemOutput, AWSError>;
