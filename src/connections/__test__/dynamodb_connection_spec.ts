import { expect } from "chai";

import { DynamoDBConnection } from "../dynamodb_connection";

import * as AWS from "aws-sdk";

describe(DynamoDBConnection.name, () => {
  describe("#constructor", () => {
    it("should work", () => {
      const conn = new DynamoDBConnection({ endpoint: undefined, enableAWSXray: false });
      expect(conn).to.be.instanceof(DynamoDBConnection);
    });
  });

  describe("#documentClient", () => {
    it("should return documentClient", () => {
      const conn = new DynamoDBConnection({ endpoint: undefined, enableAWSXray: false });
      expect(conn.documentClient).to.be.instanceof(AWS.DynamoDB.DocumentClient);
    });
  });

  describe("#client", () => {
    it("should return client", () => {
      const conn = new DynamoDBConnection({ endpoint: undefined, enableAWSXray: false });
      expect(conn.client).to.be.instanceof(AWS.DynamoDB);
    });
  });
});
