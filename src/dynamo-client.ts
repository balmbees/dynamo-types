import { DynamoDB } from 'aws-sdk';

export function createDocumentClient() {
  const documentClient = new DynamoDB.DocumentClient({
    endpoint: process.env.DYNAMO_TYPES_ENDPOINT as string,
  });

  return documentClient;
}

export function createClient() {
  const client = new DynamoDB({
    endpoint: process.env.DYNAMO_TYPES_ENDPOINT as string,
  });

  return client;
}
