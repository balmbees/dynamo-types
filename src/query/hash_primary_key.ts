import { DynamoDB } from 'aws-sdk';

import { Table, ITable } from '../table';
import * as Metadata from '../metadata';
import * as Codec from '../codec';

import { batchWrite } from "./batch_write";
import { batchGet } from "./batch_get";

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