import * as chai from 'chai';
const expect = chai.expect;

import {
  Decorator,
  Query,
  Table,
  Config,
} from '../index';

describe("Table", () => {
  @Decorator.Table({ name: "prod-Card" })
  class Card extends Table {
    @Decorator.Attribute()
    public id: number;

    @Decorator.Attribute()
    public title: string;

    @Decorator.Attribute({ timeToLive: true })
    public expiresAt: number;

    @Decorator.FullPrimaryKey('id', 'title')
    static readonly primaryKey: Query.FullPrimaryKey<Card, number, string>;

    @Decorator.Writer()
    static readonly writer: Query.Writer<Card>;
  }

  beforeEach(async () => {
    await Card.createTable();
  });
  afterEach(async () => {
    await Card.dropTable();
  });

  it("should build table metadata", () => {
    expect(Card.metadata.name).eq("prod-Card");
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

  // https://github.com/aws/aws-sdk-js/issues/1527
  // TTL doesn't supported at dynamo-local Yet
  xit("should works with TTL", async () => {
    const card = new Card();
    card.id = 10;
    card.title = "100";
    card.expiresAt = ((new Date()).valueOf() / 1000) + 100;
    await card.save();

    await new Promise((resolve, reject) => {
      setTimeout(resolve, 300);
    });

    const reloadCard = await Card.primaryKey.get(10, "100");
    console.log(reloadCard);
    expect(reloadCard).to.be.null;
  });
});