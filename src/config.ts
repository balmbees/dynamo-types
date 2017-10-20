import * as AWS from "aws-sdk";
import { DynamoDB } from "aws-sdk";

import * as HTTP from "http";
import * as HTTPS from "https";

const enableAWSXray = process.env.ENABLE_XRAY === "true";
const AWSXRay = require("aws-xray-sdk-core");

export default class Config {
  private static __documentClient: AWS.DynamoDB.DocumentClient;
  public static get documentClient() {
    if (!this.__documentClient) {
      throw new Error("Not initialized");
    }
    return this.__documentClient;
  }

  private static __client: AWS.DynamoDB;
  public static get client() {
    if (!this.__client) {
      throw new Error("Not initialized");
    }
    return this.__client;
  }

  static initalize(
    options: {
      endpoint?: string,
      enableAWSXray?: boolean,
    } = {}
  ) {
    const endpoint = (options.endpoint || process.env.DYNAMO_TYPES_ENDPOINT as string) as string | undefined;

    const dynamoDBOptions = {
      endpoint: endpoint,
      httpOptions: {
        agent: this.httpAgent(endpoint),
      }
    };

    if (enableAWSXray || options.enableAWSXray) {
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

  private static httpAgent(endpoint: string | undefined) {
    if (endpoint && endpoint.startsWith("http://")) {
      return new HTTP.Agent({
        keepAlive: true
      });
    } else {
      return new HTTPS.Agent({
        rejectUnauthorized: true,
        keepAlive: true
      });
    }
  }
}

// Initialize as a default. make sure this is safe
Config.initalize();
