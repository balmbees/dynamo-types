import { Connection, DynamoDBConnection } from "./connections";

export default class Config {
  private static __defaultConnection: Connection; // tslint:disable-line
  public static get defaultConnection() {
    if (!this.__defaultConnection) {
      this.__defaultConnection = new DynamoDBConnection({
        endpoint: process.env.DYNAMO_TYPES_ENDPOINT as string | undefined,
        enableAWSXray: process.env.ENABLE_XRAY === "true",
      });
    }
    return this.__defaultConnection;
  }
}
