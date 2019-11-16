import { DynamoDB } from "aws-sdk";
import * as _ from "lodash";

import { ITable, Table } from "../table";

import * as Codec from "../codec";
import * as Metadata from "../metadata";
import * as Query from "./query";

const HASH_KEY_REF = "#hk";
const HASH_VALUE_REF = ":hkv";

const RANGE_KEY_REF = "#rk";

export class LocalSecondaryIndex<T extends Table, HashKeyType, RangeKeyType> {
  constructor(
    readonly tableClass: ITable<T>,
    readonly metadata: Metadata.Indexes.LocalSecondaryIndexMetadata,
  ) {}

  public async query(options: {
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
    const ScanIndexForward = options.rangeOrder === "ASC";

    const params: DynamoDB.DocumentClient.QueryInput = {
      TableName: this.tableClass.metadata.name,
      Limit: options.limit,
      IndexName: this.metadata.name,
      ScanIndexForward,
      ExclusiveStartKey: options.exclusiveStartKey,
      ReturnConsumedCapacity: "TOTAL",
      KeyConditionExpression: `${HASH_KEY_REF} = ${HASH_VALUE_REF}`,
      ExpressionAttributeNames: {
        [HASH_KEY_REF]: this.tableClass.metadata.primaryKey.hash.name,
      },
      ExpressionAttributeValues: {
        [HASH_VALUE_REF]: options.hash,
      },
      ConsistentRead: options.consistent,
    };

    if (options.range) {
      const rangeKeyOptions = Query.parseCondition(options.range, RANGE_KEY_REF);
      params.KeyConditionExpression += ` AND ${rangeKeyOptions.conditionExpression}`;
      Object.assign(params.ExpressionAttributeNames, { [RANGE_KEY_REF]: this.metadata.range.name });
      Object.assign(params.ExpressionAttributeValues, rangeKeyOptions.expressionAttributeValues);
    }

    const result = await this.tableClass.metadata.connection.documentClient.query(params).promise();

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
}
