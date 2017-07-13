import { DynamoDB } from 'aws-sdk';

const client = new DynamoDB.DocumentClient({ endpoint: 'http://127.0.0.1:8080'});

export { client as client };