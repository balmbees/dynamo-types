import { expect } from "chai";
import * as faker from "faker";
import * as _ from "lodash";
import { toJS } from "../../__test__/helper";

import * as Metadata from "../../metadata";
import { Table } from "../../table";

import { HashPrimaryKey } from "../hash_primary_key";

import {
  Attribute as AttributeDecorator,
  HashPrimaryKey as HashPrimaryKeyDecorator,
  Table as TableDecorator,
} from "../../decorator";

import { AttributeExists, Between,  In } from "../expressions/conditions";
import * as Query from "../index";

describe("HashPrimaryKey", () => {
  @TableDecorator({ name: "prod-card3" })
  class Card extends Table {
    @HashPrimaryKeyDecorator("id")
    public static readonly primaryKey: Query.HashPrimaryKey<Card, number>;

    @AttributeDecorator()
    public id: number;

    @AttributeDecorator()
    public title: string;

    @AttributeDecorator()
    public count: number;
  }

  let primaryKey: HashPrimaryKey<Card, number>;

  beforeEach(async () => {
    await Card.createTable();

    primaryKey = new HashPrimaryKey<Card, number>(
      Card,
      Card.metadata.primaryKey as Metadata.Indexes.HashPrimaryKeyMetadata,
    );
  });

  afterEach(async () => {
    await Card.dropTable();
  });

  describe("#delete", async () => {
    beforeEach(async () => {
      await Card.metadata.connection.documentClient.put({
        TableName: Card.metadata.name,
        Item: {
          id: 10,
          title: "abc",
        },
      }).promise();
    });

    it("should delete item if exist", async () => {
      await primaryKey.delete(10);
    });

    context("when condition check was failed", () => {
      it("should throw error", async () => {
        const [ e ] = await toJS(primaryKey.delete(10, {
          condition: { count: AttributeExists() },
        }));

        expect(e).to.be.instanceOf(Error)
          .with.property("name", "ConditionalCheckFailedException");

        expect(e).to.have.property("message", "The conditional request failed");

        expect(await primaryKey.get(10)).not.to.eq(null);
      });
    });

    context("when condition check was passed", () => {
      it("should delete item as per provided condition", async () => {
        await primaryKey.delete(10, {
          condition: [
            { id: In([5, 10, 15]) },
            { count: AttributeExists() },
          ],
        });

        expect(await primaryKey.get(10)).to.eq(null);
      });
    });
  });

  describe("#scan", async () => {
    it("should return results", async () => {
      async function createCard() {
        const card = new Card();
        card.id = faker.random.number();
        await card.save();
        return card;
      }

      const cards = [
        await createCard(),
        await createCard(),
        await createCard(),
        await createCard(),
      ];

      const res1 = await primaryKey.scan({ limit: 2 });
      const res2 = await primaryKey.scan({ limit: 2, exclusiveStartKey: res1.lastEvaluatedKey });

      const ids = _.sortBy(
        _.concat(res1.records, res2.records),
        (item) => item.id,
      ).map((c) => c.id);

      expect(ids).to.deep.eq( _.sortBy(cards.map((c) => c.id), (i) => i) );
    });
  });

  describe("#batchGet", async () => {
    it ("should return results in order", async () => {
      async function createCard() {
        const card = new Card();
        card.id = faker.random.number();
        await card.save();
        return card;
      }

      const cards = [
        await createCard(),
        await createCard(),
        await createCard(),
        await createCard(),
      ];

      const result1 = (await primaryKey.batchGet(cards.map((c) => c.id))).records;

      // it should keep the order
      expect(result1.map((c) => c.id)).to.deep.eq(cards.map((c) => c.id));
    });
  });

  describe("#update", () => {
    it("should be able to update items", async () => {
      await primaryKey.update(10, { count: ["ADD", 1] });

      let card = await primaryKey.get(10);
      expect(card!.count).to.eq(1);

      await primaryKey.update(10, { count: ["ADD", 2] });

      card = await primaryKey.get(10);
      expect(card!.count).to.eq(3);
    });

    context("when condition check was failed", () => {
      it("should throw error", async () => {
        const [ e ] = await toJS(primaryKey.update(10, {
          count: ["ADD", 1],
        }, {
          condition: { id: AttributeExists() },
        }));

        expect(e).to.be.instanceOf(Error)
          .with.property("name", "ConditionalCheckFailedException");

        expect(e).to.have.property("message", "The conditional request failed");
      });
    });

    context("when condition check was passed", () => {
      beforeEach(async () => {
        const card = new Card();
        card.id = 22;
        card.count = 33;
        await card.save();
      });

      it("should update item as per provided condition", async () => {
        await primaryKey.update(22, {
          count: ["PUT", 123],
        }, {
          condition: [
            { count:  Between(0, 100) },
          ],
        });

        const card = await primaryKey.get(22);
        expect(card).to.have.property("count", 123);
      });
    });
  });
});
