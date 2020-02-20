import * as Metadata from "../../metadata";

import { DynamoDB } from "aws-sdk";
import * as _ from "lodash";

export async function createTable(metadata: Metadata.Table.Metadata) {
  let KeySchema: DynamoDB.Types.KeySchema;
  let AttributeDefinitions: DynamoDB.Types.AttributeDefinitions;

  if (metadata.primaryKey.type === "FULL") {
    KeySchema = [{
      AttributeName: metadata.primaryKey.hash.name,
      KeyType: "HASH",
    }, {
      AttributeName: metadata.primaryKey.range.name,
      KeyType: "RANGE",
    }];
    AttributeDefinitions = [{
      AttributeName: metadata.primaryKey.hash.name,
      AttributeType: metadata.primaryKey.hash.type,
    }, {
      AttributeName: metadata.primaryKey.range.name,
      AttributeType: metadata.primaryKey.range.type,
    }];
  } else {
    KeySchema = [{
      AttributeName: metadata.primaryKey.hash.name,
      KeyType: "HASH",
    }];
    AttributeDefinitions = [{
      AttributeName: metadata.primaryKey.hash.name,
      AttributeType: metadata.primaryKey.hash.type,
    }];
  }

  metadata.localSecondaryIndexes.map((index) => {
    AttributeDefinitions.push({
      AttributeName: index.range.name,
      AttributeType: index.range.type,
    });
  });

  metadata.globalSecondaryIndexes.map((index) => {
    AttributeDefinitions.push({
      AttributeName: index.hash.name,
      AttributeType: index.hash.type,
    });

    if (index.type === "FULL") {
      AttributeDefinitions.push({
        AttributeName: index.range.name,
        AttributeType: index.range.type,
      });
    }
  });

  AttributeDefinitions = _.uniqBy(AttributeDefinitions, (attr) => attr.AttributeName);

  const params: DynamoDB.Types.CreateTableInput = {
    /**
     * An array of attributes that describe the key schema for the table and indexes.
     */
    AttributeDefinitions,
    /**
     * The name of the table to create.`
     */
    TableName: metadata.name,
    /**
     * Specifies the attributes that make up the primary key for a table or an index.
     * The attributes in KeySchema must also be defined in the AttributeDefinitions array.
     * For more information, see Data Model in the Amazon DynamoDB Developer Guide.
     * Each KeySchemaElement in the array is composed of:
     *   AttributeName - The name of this key attribute.
     *   KeyType - The role that the key attribute will assume:
     *     HASH - partition key
     *     RANGE - sort key
     * The partition key of an item is also known as its hash attribute.
     * The term "hash attribute" derives from DynamoDB' usage of an internal hash function to evenly distribute
     * data items across partitions, based on their partition key values.
     *
     * The sort key of an item is also known as its range attribute.
     * The term "range attribute" derives from the way DynamoDB stores items with the same partition key physically
     * close together, in sorted order by the sort key value.
     *
     * For a simple primary key (partition key),
     * you must provide exactly one element with a KeyType of HASH.
     * For a composite primary key (partition key and sort key), you must provide exactly two elements, in this order:
     * The first element must have a KeyType of HASH, and the second element must have a KeyType of RANGE.
     *
     * For more information, see Specifying the Primary Key in the Amazon DynamoDB Developer Guide.
     */
    KeySchema,
    LocalSecondaryIndexes:
      metadata.localSecondaryIndexes.length > 0 ?
        metadata.localSecondaryIndexes.map((index) => {
          return {
            IndexName: index.name,
            KeySchema: [{
              AttributeName: metadata.primaryKey.hash.name,
              KeyType: "HASH",
            }, {
              AttributeName: index.range.name,
              KeyType: "RANGE",
            }],
            Projection: {
              ProjectionType: "ALL",
            },
          };
        }) : undefined,
    GlobalSecondaryIndexes:
      metadata.globalSecondaryIndexes.length > 0 ?
        metadata.globalSecondaryIndexes.map((index) => {
          if (index.type === "FULL") {
            return {
              IndexName: index.name,
              KeySchema: [{
                AttributeName: index.hash.name,
                KeyType: "HASH",
              }, {
                AttributeName: index.range.name,
                KeyType: "RANGE",
              }],
              Projection: {
                ProjectionType: "ALL",
              },
            };
          } else {
            return {
              IndexName: index.name,
              KeySchema: [{
                AttributeName: index.hash.name,
                KeyType: "HASH",
              }],
              Projection: {
                ProjectionType: "ALL",
              },
            };
          }
        }) : undefined,
    BillingMode: "PAY_PER_REQUEST"
    // StreamSpecification?: StreamSpecification;
  };

  const res = await metadata.connection.client.createTable(params).promise();

  await metadata.connection.client.waitFor("tableExists", { TableName: metadata.name}).promise();

  // TTL
  const ttlAttribute = metadata.attributes.find((attr) => !!attr.timeToLive);
  if (ttlAttribute) {
    await metadata.connection.client.updateTimeToLive({
      TableName: metadata.name,
      TimeToLiveSpecification: {
        Enabled: true,
        AttributeName: ttlAttribute.name,
      },
    }).promise();
  }

  return res.TableDescription;
}
