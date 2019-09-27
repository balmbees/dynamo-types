import { expect } from "chai";

import {
  Decorator,
  Query,
  Table,
} from "../index";

describe("Table", () => {
  @Decorator.Table({ name: `prod-Card${Math.random()}` })
  class Card extends Table {
    @Decorator.FullPrimaryKey("id", "title")
    public static readonly primaryKey: Query.FullPrimaryKey<Card, number, string>;

    @Decorator.HashGlobalSecondaryIndex("title")
    public static readonly titleIndex: Query.HashGlobalSecondaryIndex<Card, string>;

    @Decorator.Writer()
    public static readonly writer: Query.Writer<Card>;

    @Decorator.Attribute()
    public id: number;

    @Decorator.Attribute()
    public title: string;

    @Decorator.Attribute({ timeToLive: true })
    public expiresAt: number;
  }

  beforeEach(async () => {
    await Card.createTable();
  });
  afterEach(async () => {
    await Card.dropTable();
  });

  it("should create primaryKey", () => {
    expect(Card.primaryKey).to.be.instanceof(Query.FullPrimaryKey);
  });

  it("should have writer", () => {
    expect(Card.writer).to.be.instanceof(Query.Writer);
  });

  it("should have attributes properties", async () => {
    const card = new Card();
    card.id = 10;
    card.title = "100";

    await card.save();

    const reloadedCard = await Card.primaryKey.get(10, "100");
    expect(reloadedCard).to.be.instanceof(Card);
    expect(reloadedCard!.id).to.eq(10);
    expect(reloadedCard!.title).to.eq("100");
  });

  it("should works with TTL", async () => {
    const card = new Card();
    card.id = 10;
    card.title = "100";
    card.expiresAt = Math.floor(Date.now() / 1000) + 3; // unix timestamp after 3 sec
    await card.save();

    // Wait 10 sec
    await new Promise((resolve) => setTimeout(resolve, 10000));

    const reloaded = await Card.primaryKey.get(10, "100", { consistent: true });
    expect(reloaded).to.eq(null);
  });
});
