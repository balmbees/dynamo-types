import { Connection } from "./connection";

import * as AWS from "aws-sdk";
import { DynamoDB } from "aws-sdk";

const AmazonDaxClient = require('amazon-dax-client');

export class DAXConnection implements Connection {
  constructor(options: {
    endpoints: string[],
    requestTimeout?: number,
  }) {
    this.__client = new AmazonDaxClient({
      endpoints: options.endpoints,
      requestTimeout: options.requestTimeout,
    });
    this.__documentClient = new DynamoDB.DocumentClient({ service: this.__client });
  }

  private __documentClient: AWS.DynamoDB.DocumentClient;
  public get documentClient() {
    return this.__documentClient;
  }

  private __client: AWS.DynamoDB;
  public get client() {
    return this.__client;
  }
}