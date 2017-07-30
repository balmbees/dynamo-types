import * as Metadata from '../metadata';

import { DynamoDB } from 'aws-sdk';

export async function dropTable(metadata: Metadata.Table.Metadata, client: DynamoDB) {
  return await client.deleteTable({ TableName: metadata.name }).promise();
}