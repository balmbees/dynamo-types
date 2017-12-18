// Represent "Connection" to DynamoDB

import * as AWS from "aws-sdk";

export interface Connection {
  readonly documentClient: AWS.DynamoDB.DocumentClient;
  readonly client: AWS.DynamoDB;
}
