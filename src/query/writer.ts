// Since in DyanmoDB writing is free from any kind index or what soever
// whole "writing" operations are bundled into one here

import { ITable, Table } from '../table';
import { DynamoDB } from 'aws-sdk';

import * as Codec from '../codec';
import * as Metadata from '../metadata';

export class Writer<T extends Table> {
  constructor(
    private tableClass: ITable<T>,
    private documentClient: DynamoDB.DocumentClient
  ) {
  }

  async put(record: T) {
    const res = await this.documentClient.put({
      TableName: this.tableClass.metadata.name,
      Item: Codec.serialize(this.tableClass, record),
    }).promise();

    record.setAttributes(res.Attributes || {});
    return record;
  }

  async batchPut(records: T[]) {
    const res = await this.documentClient.batchWrite({
      RequestItems: {
        [this.tableClass.metadata.name]: records.map(record => {
          return {
            PutRequest: {
              Item: Codec.serialize(this.tableClass, record),
            },
          };
        }),
      }
    }).promise();
  }

  async delete(record: T) {
    await this.documentClient.delete({
      TableName: this.tableClass.metadata.name,
      Key: KeyFromRecord(record, this.tableClass.metadata.primaryKey),
    })
  }
}

function KeyFromRecord<T extends Table>(
  record: T,
  metadata: Metadata.Indexes.FullPrimaryKeyMetadata | Metadata.Indexes.HashPrimaryKeyMetadata
) {
  if (metadata.type == 'HASH') {
    return {
      [metadata.hash.name]: record.getAttribute(metadata.hash.name)
    };
  } else {
    return {
      [metadata.hash.name]: record.getAttribute(metadata.hash.name),
      [metadata.range.name]: record.getAttribute(metadata.range.name)
    };
  }
}
