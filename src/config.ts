import * as AWS from "aws-sdk";
import { DynamoDB } from "aws-sdk";

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
    if (enableAWSXray || options.enableAWSXray) {
      const aws = AWSXRay.captureAWS(AWS);
      this.__documentClient = new aws.DynamoDB.DocumentClient({
        endpoint: options.endpoint || process.env.DYNAMO_TYPES_ENDPOINT as string,
      });
      this.__client = new aws.DynamoDB({
        endpoint: options.endpoint || process.env.DYNAMO_TYPES_ENDPOINT as string,
      });
    } else {
      this.__documentClient = new DynamoDB.DocumentClient({
        endpoint: options.endpoint || process.env.DYNAMO_TYPES_ENDPOINT as string,
      });
      this.__client = new DynamoDB({
        endpoint: options.endpoint || process.env.DYNAMO_TYPES_ENDPOINT as string,
      });
    }
  }
}

// Initialize as a default. make sure this is safe
Config.initalize();
