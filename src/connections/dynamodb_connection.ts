import { Connection } from "./connection";

import * as AWS from "aws-sdk";
import { DynamoDB } from "aws-sdk";

import * as HTTP from "http";
import * as HTTPS from "https";

export class DynamoDBConnection implements Connection {
  private __documentClient: AWS.DynamoDB.DocumentClient; // tslint:disable-line
  private __client: AWS.DynamoDB; // tslint:disable-line

  constructor(options: {
    region?: string;
    endpoint: string | undefined;
    enableAWSXray: boolean;
  }) {
    const dynamoDBOptions: DynamoDB.ClientConfiguration = {
      region: options.region,
      endpoint: options.endpoint,
      httpOptions: {
        agent: this.httpAgent(options.endpoint),
      },
    };

    if (options.enableAWSXray) {
      // Since "require" itself does something for this lib, such as logging
      // importing this only when it's needed
      const AWSXRay = require("aws-xray-sdk-core");
      const aws = AWSXRay.captureAWS(AWS);
      this.__client = new aws.DynamoDB(dynamoDBOptions);
      this.__documentClient = new aws.DynamoDB.DocumentClient({
        service: this.__client,
      });
    } else {
      this.__client = new DynamoDB(dynamoDBOptions);
      this.__documentClient = new DynamoDB.DocumentClient({
        service: this.__client,
      });
    }
  }

  private httpAgent(endpoint: string | undefined) {
    if (endpoint && endpoint.startsWith("http://")) {
      return new HTTP.Agent({
        keepAlive: true,
      });
    } else {
      return new HTTPS.Agent({
        rejectUnauthorized: true,
        keepAlive: true,
      });
    }
  }

  public get documentClient() {
    return this.__documentClient;
  }

  public get client() {
    return this.__client;
  }
}
