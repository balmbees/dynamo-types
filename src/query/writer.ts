// Since in DyanmoDB writing is free from any kind index or what soever
// whole "writing" operations are bundled into one here

import { ITable, Table } from "../table";

import * as Codec from "../codec";
import * as Metadata from "../metadata";
import { batchWrite } from "./batch_write";

import { Conditions } from "./expressions/conditions";
import { buildCondition } from "./expressions/transformers";

export class Writer<T extends Table> {
  constructor(private tableClass: ITable<T>) {
  }

  public async put(
    record: T,
    options: Partial<{
      condition: Conditions<T> | Array<Conditions<T>>;
    }> = {},
  ) {
    try {
      const res = await this.tableClass.metadata.connection.documentClient.put({
        TableName: this.tableClass.metadata.name,
        Item: Codec.serialize(this.tableClass, record),
        ...buildCondition(this.tableClass.metadata, options.condition),
      }).promise();

      record.setAttributes(res.Attributes || {});
      return record;
    } catch (e) {
      // tslint:disable-next-line
      console.log(`Dynamo-Types Put - ${JSON.stringify(record.serialize(), null, 2)}`);
      throw e;
    }
  }

  public async batchPut(records: T[]) {
    return await batchWrite(
      this.tableClass.metadata.connection.documentClient,
      this.tableClass.metadata.name,
      records.map((record) => {
        return {
          PutRequest: {
            Item: Codec.serialize(this.tableClass, record),
          },
        };
      }),
    );
  }

  public async delete(
    record: T,
    options: Partial<{
      condition: Conditions<T> | Array<Conditions<T>>;
    }> = {},
  ) {
    await this.tableClass.metadata.connection.documentClient.delete({
      TableName: this.tableClass.metadata.name,
      Key: KeyFromRecord(record, this.tableClass.metadata.primaryKey),
      ...buildCondition(this.tableClass.metadata, options.condition),
    }).promise();
  }
}

function KeyFromRecord<T extends Table>(
  record: T,
  metadata: Metadata.Indexes.FullPrimaryKeyMetadata | Metadata.Indexes.HashPrimaryKeyMetadata,
) {
  if (metadata.type === "HASH") {
    return {
      [metadata.hash.name]: record.getAttribute(metadata.hash.name),
    };
  } else {
    return {
      [metadata.hash.name]: record.getAttribute(metadata.hash.name),
      [metadata.range.name]: record.getAttribute(metadata.range.name),
    };
  }
}
