import { DynamoDB } from 'aws-sdk';

import { Table, ITable } from '../table';
import * as Metadata from '../metadata';
import * as Codec from '../codec';

import { batchWrite } from "./batch_write";
import { batchGet } from "./batch_get";
import * as Scan from "./scan";

const HASH_KEY_REF = "#hk";
const HASH_VALUE_REF = ":hkv";

const RANGE_KEY_REF = "#rk";

export class HashPrimaryKey<T extends Table, HashKeyType> {
  constructor(
    readonly tableClass: ITable<T>,
    readonly metadata: Metadata.Indexes.HashPrimaryKeyMetadata,
    readonly documentClient: DynamoDB.DocumentClient
  ) {}

  async delete(hashKey: HashKeyType) {
    const res = await this.documentClient.delete({
      TableName: this.tableClass.metadata.name,
      Key: {
        [this.metadata.hash.name]: hashKey,
      },
    }).promise();
  }

  async get(hashKey: HashKeyType): Promise<T | null> {
    const dynamoRecord =
      await this.documentClient.get({
        TableName: this.tableClass.metadata.name,
        Key: {
          [this.metadata.hash.name]: hashKey,
        },
      }).promise();
    if (!dynamoRecord.Item) {
      return null;
    } else {
      return Codec.deserialize(this.tableClass, dynamoRecord.Item)
    }
  }

  // async query(options: {
  //   hash: HashKeyType,
  //   range?: Query.Conditions<RangeKeyType>,
  //   rangeOrder?: "ASC" | "DESC",
  //   limit?: number,
  //   exclusiveStartKey?: DynamoDB.DocumentClient.Key,
  // }) {
  //   if (!options.rangeOrder) {
  //     options.rangeOrder = "ASC";
  //   }
  //   const ScanIndexForward = options.rangeOrder === "ASC"

  //   const params: DynamoDB.DocumentClient.QueryInput = {
  //     TableName: this.tableClass.metadata.name,
  //     Limit: options.limit,
  //     ScanIndexForward: ScanIndexForward,
  //     ExclusiveStartKey: options.exclusiveStartKey,
  //     ReturnConsumedCapacity: "TOTAL",
  //     KeyConditionExpression: `${HASH_KEY_REF} = ${HASH_VALUE_REF}`,
  //     ExpressionAttributeNames: {
  //       [HASH_KEY_REF]: this.metadata.hash.name,
  //     },
  //     ExpressionAttributeValues: {
  //       [HASH_VALUE_REF]: options.hash,
  //     },
  //   };

  //   if (options.range) {
  //     const rangeKeyOptions = Query.parseCondition(options.range, RANGE_KEY_REF);
  //     params.KeyConditionExpression += ` AND ${rangeKeyOptions.conditionExpression}`;
  //     Object.assign(params.ExpressionAttributeNames, { [RANGE_KEY_REF]: this.metadata.range.name });
  //     Object.assign(params.ExpressionAttributeValues, rangeKeyOptions.expressionAttributeValues);
  //   }

  //   const result = await this.documentClient.query(params).promise();

  //   return {
  //     records: (result.Items || []).map(item => {
  //       return Codec.deserialize(this.tableClass, item);
  //     }),
  //     count: result.Count,
  //     scannedCount: result.ScannedCount,
  //     lastEvaluatedKey: result.LastEvaluatedKey,
  //     consumedCapacity: result.ConsumedCapacity,
  //   };
  // }

  async batchGet(keys: Array<HashKeyType>) {
    const res = await batchGet(
      this.documentClient,
      this.tableClass.metadata.name,
      keys.map((key) => {
        return {
          [this.metadata.hash.name]: key,
        }
      })
    );

    return {
      records: res.map(item => {
        return Codec.deserialize(this.tableClass, item);
      })
    };
  }

  async batchDelete(keys: Array<[HashKeyType]>) {
    return await batchWrite(
      this.documentClient,
      this.tableClass.metadata.name,
      keys.map(key => {
        return {
          DeleteRequest: {
            Key: {
              [this.metadata.hash.name]: key[0],
            },
          },
        };
      }),
    );
  }

  // Let'just don't use Scan if it's possible
  // async scan()
  async update(
    hashKey: HashKeyType,
    changes: {
      [key: string]: [
        DynamoDB.DocumentClient.AttributeAction,
        any
      ],
    },
  ): Promise<void> {
    // Select out only declared Attributes
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
        },
        AttributeUpdates: attributeUpdates,
      }).promise();
  }
}