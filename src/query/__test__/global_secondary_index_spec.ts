import { expect } from "chai";

import { Table } from "../../table";

import * as Decorator from "../../decorator";

import * as Query from "../index";

@Decorator.Table({ name: "prod-Card" })
class Card extends Table {
  @Decorator.FullPrimaryKey("id", "title")
  public static readonly primaryKey: Query.FullPrimaryKey<Card, number, string>;

  @Decorator.HashGlobalSecondaryIndex("title")
  public static readonly hashTitleIndex: Query.HashGlobalSecondaryIndex<Card, string>;

  @Decorator.FullGlobalSecondaryIndex("title", "count")
  public static readonly fullTitleIndex: Query.FullGlobalSecondaryIndex<Card, string, number>;

  @Decorator.Attribute()
  public id: number;

  @Decorator.Attribute()
  public title: string;

  @Decorator.Attribute()
  public count: number;
}

describe("HashGlobalSecondaryIndex", () => {
  beforeEach(async () => {
    await Card.createTable();
  });

  afterEach(async () => {
    await Card.dropTable();
  });

  describe("#query", () => {
    it("should find items", async () => {
      await Card.metadata.connection.documentClient.put({
        TableName: Card.metadata.name,
        Item: {
          id: 10,
          title: "abc",
        },
      }).promise();
      await Card.metadata.connection.documentClient.put({
        TableName: Card.metadata.name,
        Item: {
          id: 11,
          title: "abd",
        },
      }).promise();
      await Card.metadata.connection.documentClient.put({
        TableName: Card.metadata.name,
        Item: {
          id: 12,
          title: "abd",
        },
      }).promise();

      const res = await Card.hashTitleIndex.query("abd");
      expect(res.records.length).to.eq(2);
      expect(res.records[0].id).to.eq(12);
      expect(res.records[1].id).to.eq(11);
    });
  });

  describe("#scan", async () => {
    const cardIds = [111, 222, 333, 444, 555];

    beforeEach(async () => {
      for (const cardId of cardIds) {
        await Card.metadata.connection.documentClient.put({
          TableName: Card.metadata.name,
          Item: {
            id: cardId,
            title: cardId.toString(),
          },
        }).promise();
      }
    });

    it("should return results", async () => {
      const res1 = await Card.hashTitleIndex.scan();
      const res2 = await Card.hashTitleIndex.scan({ limit: 2 });
      const res3 = await Card.hashTitleIndex.scan({ limit: 2, exclusiveStartKey: res2.lastEvaluatedKey });

      expect(res1.records.map((r) => r.id)).to.have.all.members(cardIds);
      expect(cardIds).to.include.members(res2.records.map((r) => r.id));
      expect(cardIds).to.include.members(res3.records.map((r) => r.id));
    });
  });
});

describe("FullGlobalSecondaryIndex", () => {
  beforeEach(async () => {
    await Card.createTable();
  });

  afterEach(async () => {
    await Card.dropTable();
  });

  describe("#query", () => {
    it("should find items", async () => {
      await Card.metadata.connection.documentClient.put({
        TableName: Card.metadata.name,
        Item: {
          id: 10,
          title: "abc",
          count: 10,
        },
      }).promise();
      await Card.metadata.connection.documentClient.put({
        TableName: Card.metadata.name,
        Item: {
          id: 11,
          title: "abd",
          count: 11,
        },
      }).promise();
      await Card.metadata.connection.documentClient.put({
        TableName: Card.metadata.name,
        Item: {
          id: 12,
          title: "abd",
          count: 12,
        },
      }).promise();
      await Card.metadata.connection.documentClient.put({
        TableName: Card.metadata.name,
        Item: {
          id: 13,
          title: "abd",
          count: 13,
        },
      }).promise();

      const res = await Card.fullTitleIndex.query({
        hash: "abd",
        range: [">=", 12],
        rangeOrder: "DESC",
      });
      expect(res.records.length).to.eq(2);

      expect(res.records[0].id).to.eq(13);
      expect(res.records[1].id).to.eq(12);
    });
  });

  describe("#scan", async () => {
    const cardIds = [111, 222, 333, 444, 555];

    beforeEach(async () => {
      for (const cardId of cardIds) {
        await Card.metadata.connection.documentClient.put({
          TableName: Card.metadata.name,
          Item: {
            id: cardId,
            title: cardId.toString(),
            // only even items have "count",
            count: cardId % 2 === 0 ? 1 : undefined
          },
        }).promise();
      }
    });

    it("should return results", async () => {
      const res1 = await Card.fullTitleIndex.scan();
      const res2 = await Card.fullTitleIndex.scan({ limit: 2 });
      const res3 = await Card.fullTitleIndex.scan({ limit: 2, exclusiveStartKey: res2.lastEvaluatedKey });

      expect(res1.records.map((r) => r.id)).to.have.all.members([222, 444]);
      expect(cardIds).to.include.members(res2.records.map((r) => r.id));
      expect(cardIds).to.include.members(res3.records.map((r) => r.id));
    });
  });
});
