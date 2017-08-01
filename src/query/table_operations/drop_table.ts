import * as Metadata from '../../metadata';

import { DynamoDB } from 'aws-sdk';

export async function dropTable(metadata: Metadata.Table.Metadata, client: DynamoDB) {
  const res = await client.deleteTable({ TableName: metadata.name }).promise();
  return res.TableDescription;
}