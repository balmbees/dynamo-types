import { DynamoDB } from "aws-sdk";
import * as _ from "lodash";

// this is limit of dynamoDB
const MAX_ITEMS = 25;

export async function batchWrite(
  documentClient: DynamoDB.DocumentClient,
  tableName: string,
  requests: DynamoDB.DocumentClient.WriteRequest[]
) {
  const res = await Promise.all(
    _.chunk(requests, MAX_ITEMS)
      .map(async chunk => {
        const res =
          await documentClient.batchWrite({
            RequestItems: {
              [tableName]: chunk,
            }
          }).promise();
        return res;
      })
  );
}