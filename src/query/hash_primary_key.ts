import { DynamoDB } from 'aws-sdk';

import { Table, ITable } from '../table';
import * as Metadata from '../metadata';

import * as Codec from '../codec';

import * as RangeKeyOperation from './range_key_operation';

const HASH_KEY_REF = "#hk";
const HASH_VALUE_REF = ":hkv";

const RANGE_KEY_REF = "#rk";

export class HashPrimaryKey<T extends Table, HashKeyType> {
  constructor(
    readonly tableClass: ITable<T>,
    readonly metadata: Metadata.Indexes.HashPrimaryKeyMetadata,
    readonly documentClient: DynamoDB.DocumentClient
  ) {}

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
    // Todo check length of keys
    const res = await this.documentClient.batchGet({
      RequestItems: {
        [this.tableClass.metadata.name]: {
          Keys: keys.map((key) => {
            return {
              [this.metadata.hash.name]: key,
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

  // Let'just don't use Scan if it's possible
  // async scan()
}