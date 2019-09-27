import { expect } from "chai";

import { Table } from "../../table";

import * as Decorator from "../../decorator";

import * as Query from "../index";

@Decorator.Table({ name: "prod-Card-3" })
class Card extends Table {
  @Decorator.FullPrimaryKey("id", "title")
  public static readonly primaryKey: Query.FullPrimaryKey<Card, number, string>;

  @Decorator.LocalSecondaryIndex("count")
  public static readonly countIndex: Query.LocalSecondaryIndex<Card, number, number>;

  @Decorator.Writer()
  public static readonly writer: Query.Writer<Card>;

  public static create(id: number, title: string, count: number) {
    const record = new this();
    record.id = id;
    record.title = title;
    record.count = count;
    return record;
  }

  @Decorator.Attribute()
  public id: number;

  @Decorator.Attribute()
  public title: string;

  @Decorator.Attribute()
  public count: number;
}

describe("LocalSecondaryIndex", () => {
  beforeEach(async () => {
    await Card.createTable();
  });

  afterEach(async () => {
    await Card.dropTable();
  });

  describe("#query", () => {
    it("should find items", async () => {
      await Card.writer.batchPut([
        Card.create(10, "a", 4),
        Card.create(10, "b", 3),
        Card.create(10, "c", 2),
        Card.create(10, "d", 1),
      ]);

      const res = await Card.countIndex.query({
        hash: 10,
        rangeOrder: "DESC",
        range: [">", 2],
      });

      expect(res.records.length).to.eq(2);

      expect(res.records[0].count).to.eq(4);
      expect(res.records[1].count).to.eq(3);
    });
  });
});
