import { expect } from "chai";

import {
  Decorator,
  Query,
  Table,
  TransactionWrite,
} from "../index";
import { NumberSet, StringSet } from "../metadata/attribute";
import { toJS } from "./helper";

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

    @Decorator.Attribute()
    public followers: StringSet;

    @Decorator.Attribute()
    public tags: NumberSet;

    @Decorator.Attribute({ timeToLive: true })
    public expiresAt: number;

    @Decorator.Attribute()
    public content: string;

    @Decorator.Attribute()
    public author: string;
  }

  beforeEach(async () => {
    await Card.createTable();
  });
  afterEach(async () => {
    await Card.dropTable();
  });

  it("should do transaction write", async () => {
    const transaction = new TransactionWrite();

    const card1 = new Card();
    card1.id = 1;
    card1.title = "100";
    card1.followers = new StringSet(["U1", "U2", "U3"]);
    card1.tags = new NumberSet([1, 2, 3]);
    await card1.save();

    const card2 = new Card();
    card2.id = 2;
    card2.title = "100";
    card2.followers = new StringSet(["U1", "U2", "U3"]);
    card2.tags = new NumberSet([1, 2, 3]);
    await card2.save();

    const card3 = new Card();
    card3.id = 3;
    card3.title = "100";
    card3.followers = new StringSet(["U1", "U2", "U3"]);
    card3.tags = new NumberSet([1, 2, 3]);
    await card3.save();

    const card4 = new Card();
    card4.id = 4;
    card4.title = "100";
    card4.followers = new StringSet(["U1", "U2", "U3"]);
    card4.tags = new NumberSet([1, 2, 3]);
    await card4.save();

    card1.content = "content";
    card1.transactionSave(transaction);

    Card.primaryKey.transactionUpdate(transaction, card2.id, card2.title, {
      author: ["PUT", "author"]
    });

    Card.primaryKey.transactionDelete(transaction, card3.id, card3.title);

    card4.transactionDelete(transaction);
    await transaction.commit();

    const card1Reloaded = await Card.primaryKey.get(1, "100");
    const card2Reloaded = await Card.primaryKey.get(2, "100");
    const card3Reloaded = await Card.primaryKey.get(3, "100");
    const card4Reloaded = await Card.primaryKey.get(4, "100");

    expect(card1Reloaded!.content).to.be.eq("content");
    expect(card2Reloaded!.author).to.be.eq("author");
    // tslint:disable-next-line: no-unused-expression
    expect(card3Reloaded).to.be.null;
    // tslint:disable-next-line: no-unused-expression
    expect(card4Reloaded).to.be.null;

  });

});
