import { expect } from "chai";
import { toJS } from "../../__test__/helper";

import {
  Attribute as AttributeDecorator,
  FullPrimaryKey as FullPrimaryKeyDecorator,
  Table as TableDecorator,
} from "../../decorator";

import * as Query from "../index";
import * as TableOperations from "../table_operations";
import { Writer } from "../writer";

import { Table } from "../../table";
import { AttributeNotExists, GreaterThan } from "../index";

@TableDecorator({ name: "prod-Card4" })
class Card extends Table {
  @FullPrimaryKeyDecorator("i", "t")
  public static readonly primaryKey: Query.FullPrimaryKey<Card, number, string>;

  @AttributeDecorator({ name: "i" })
  public id: number;

  @AttributeDecorator({ name: "t" })
  public title: string;

  @AttributeDecorator( { name: "c" })
  public count: number;
}

describe("Writer", () => {
  beforeEach(async () => {
    await TableOperations.createTable(Card.metadata);
  });
  afterEach(async () => {
    await TableOperations.dropTable(Card.metadata);
  });

  describe("put", () => {
    it("should put or update record", async () => {
      const card = new Card();
      card.id = 100;
      card.title = "100";

      const writer = new Writer(Card);
      await writer.put(card);

      const reloadedCard = await Card.primaryKey.get(100, "100");
      expect(reloadedCard).to.be.instanceof(Card);
      expect(reloadedCard!.id).to.be.eq(100);
      expect(reloadedCard!.title).to.be.eq("100");
    });

    context("when condition check was failed", () => {
      let card: Card;
      let writer: Writer<Card>;

      beforeEach(async () => {
        card = new Card();
        card.id = 100;
        card.title = "100";

        writer = new Writer(Card);
        await writer.put(card);
      });

      it("should throw error", async () => {
        const [ e ] = await toJS(writer.put(card, {
          condition: { id: AttributeNotExists() },
        }));

        expect(e).to.be.instanceOf(Error)
          .with.property("name", "ConditionalCheckFailedException");

        expect(e).to.have.property("message", "The conditional request failed");
      });
    });

    context("when condition check was passed", () => {
      let card: Card;
      let writer: Writer<Card>;

      beforeEach(async () => {
        card = new Card();
        card.id = 100;
        card.title = "100";
        card.count = 500;

        writer = new Writer(Card);
        await writer.put(card);
      });

      it("should put item as per provided condition", async () => {
        card.count = 7000;
        await writer.put(card, {
          condition: {
            count: GreaterThan(300),
          },
        });

        const reloadedCard = await Card.primaryKey.get(100, "100");
        expect(reloadedCard).to.be.instanceof(Card);
        expect(reloadedCard!.count).to.eq(7000);
      });
    });
  });
});
