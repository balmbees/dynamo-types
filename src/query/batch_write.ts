import { DynamoDB } from "aws-sdk";
import * as _ from "lodash";

// this is limit of dynamoDB
const MAX_ITEMS = 25;

export async function batchWrite(
  documentClient: DynamoDB.DocumentClient,
  tableName: string,
  requests: DynamoDB.DocumentClient.WriteRequest[]
) {
  try {
    await Promise.all(
      _.chunk(requests, MAX_ITEMS)
        .map(async chunk => {
          await documentClient.batchWrite({
            RequestItems: {
              [tableName]: chunk,
            }
          }).promise();
        })
    );
  } catch (e) {
    console.log(`Dynamo-Types batchWrite - ${JSON.stringify(requests, null, 2)}`);
    throw e;
  }
}