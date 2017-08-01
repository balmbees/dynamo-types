import { DynamoDB } from 'aws-sdk';

export default class Config {
  private static __documentClient: DynamoDB.DocumentClient;
  public static get documentClient() {
    if (!this.__documentClient) {
      throw new Error("Not initialized");
    }
    return this.__documentClient;
  }

  private static __client: DynamoDB;
  public static get client() {
    if (!this.__client) {
      throw new Error("Not initialized");
    }
    return this.__client;
  }

  static initalize(
    options: {
      endpoint?: string
    } = {}
  ) {
    this.__documentClient = new DynamoDB.DocumentClient({
      endpoint: options.endpoint || process.env.DYNAMO_TYPES_ENDPOINT as string,
    });
    this.__client = new DynamoDB({
      endpoint: options.endpoint || process.env.DYNAMO_TYPES_ENDPOINT as string,
    });
  }
}

// Initialize as a default. make sure this is safe
Config.initalize();
