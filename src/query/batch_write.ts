import { DynamoDB } from "aws-sdk";

import * as Bluebird from "bluebird";
import * as _ from "lodash";

// this is limit of dynamoDB
const MAX_ITEMS = 25;

// This is custom limit
const MAX_RETRY = 5;

export async function batchWrite(
  documentClient: DynamoDB.DocumentClient,
  tableName: string,
  requests: DynamoDB.DocumentClient.WriteRequest[]
) {
  try {
    const res = await Promise.all(
      _.chunk(requests, MAX_ITEMS)
        .map(async chunk =>
          await documentClient.batchWrite({ RequestItems: { [tableName]: chunk } }).promise()
        )
    );

    let failedRequests = _.flatMap(res, r => (r.UnprocessedItems || {})[tableName] || []);
    let retryCount = 0;
    while (retryCount < MAX_RETRY && failedRequests.length > 0) {
      console.log(`Dynamo-Types batchWrite FailedRequests: ${failedRequests.length}, Try: ${retryCount}`);
      failedRequests = _.flatMap(
        await Bluebird.mapSeries(
          _.chunk(failedRequests, MAX_ITEMS),
          async (chunk) =>
            await documentClient.batchWrite({ RequestItems: { [tableName]: chunk } }).promise()
        )
        , r => (r.UnprocessedItems || {})[tableName]
      )

      retryCount ++;
    }
  } catch (e) {
    console.log(`Dynamo-Types batchWrite - ${JSON.stringify(requests, null, 2)}`);
    throw e;
  }
}
