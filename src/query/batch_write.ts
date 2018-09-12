import { DynamoDB } from "aws-sdk";

import * as Bluebird from "bluebird";
import * as _ from "lodash";

// this is limit of dynamoDB
const MAX_ITEMS = 25;

// This is custom limit
const MAX_RETRY = Number.MAX_SAFE_INTEGER;

export async function batchWrite(
  documentClient: DynamoDB.DocumentClient,
  tableName: string,
  requests: DynamoDB.DocumentClient.WriteRequest[]
) {
  try {
    const res = await Bluebird.map(
      _.chunk(requests, MAX_ITEMS)
      , async chunk =>
        await documentClient.batchWrite({ RequestItems: { [tableName]: chunk } }).promise()
      , { concurrency: Number(process.env.BATCH_WRITE_CONCURRENCY || 1) }
    )

    let failedRequests = _.flatMap(res, r => (r.UnprocessedItems || {})[tableName] || []);
    let retryCount = 0;
    while (retryCount < MAX_RETRY && failedRequests.length > 0) {
      console.log(`Dynamo-Types batchWrite FailedRequests: ${failedRequests.length}, Try: ${retryCount}`);
      failedRequests = _.flatMap(
        await Bluebird.mapSeries(
          _.chunk(failedRequests, MAX_ITEMS),
          async (chunk) => {
            // console.log(`Chunk: ${chunk.length}`);
            return await documentClient.batchWrite({ RequestItems: { [tableName]: chunk } }).promise()
          }
        )
        , r => (r.UnprocessedItems || {})[tableName] || []
      )

      retryCount ++;
    }
  } catch (e) {
    console.log(`Dynamo-Types batchWrite - ${JSON.stringify(requests)}`);
    throw e;
  }
}
