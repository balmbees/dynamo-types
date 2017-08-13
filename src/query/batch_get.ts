import { DynamoDB } from "aws-sdk";
import * as _ from "lodash";

// this is limit of dynamoDB
const MAX_ITEMS = 100;

// 1. BatchGet keeps the order
export async function batchGet(
  documentClient: DynamoDB.DocumentClient,
  tableName: string,
  keys: DynamoDB.DocumentClient.KeyList,
) {

  try {
    const res = await Promise.all(
      _.chunk(keys, MAX_ITEMS)
        .map(async keysChunk => {
          const res =
            await documentClient.batchGet({
              RequestItems: {
                [tableName]: {
                  Keys: keysChunk,
                },
              },
            }).promise();

          // Batch get doesn't sort the output follow to input.
          return _.sortBy(
            res.Responses![tableName]
            , (record, index) => {
              const keyIndex = keysChunk.findIndex((keys) => {
                for (let keyName in keys) {
                  if (record[keyName] !== keys[keyName]) {
                    return false;
                  }
                }
                return true;
              });
              if (keyIndex < 0) {
                // Key exists in Output, but not in input. SOMETHING IS WEIRD!
                throw new Error("BatchGet : Key exists in Output, but not in input. SOMETHING IS WEIRD!");
              }
              return keyIndex;
            });
        })
    );

    return _.concat([], ...res);
  } catch (e) {
    console.log(`Dynamo-Types batchGet - ${JSON.stringify(keys, null, 2)}`);
    throw e;
  }
}