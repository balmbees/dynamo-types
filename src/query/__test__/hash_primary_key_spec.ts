import * as chai from 'chai';
import * as faker from 'faker';

const expect = chai.expect;

import * as _ from 'lodash';

import { Table } from '../../table';
import * as Metadata from '../../metadata';

import { HashPrimaryKey } from '../hash_primary_key';

import {
  Table as TableDecorator,
  Attribute as AttributeDecorator,
  HashPrimaryKey as HashPrimaryKeyDecorator,
} from '../../decorator';

import * as Query from '../index';

describe("HashPrimaryKey", () => {
  @TableDecorator({ name: "prod-card3" })
  class Card extends Table {
    @AttributeDecorator()
    public id: number;

    @AttributeDecorator()
    public title: string;

    @AttributeDecorator()
    public count: number;

    @HashPrimaryKeyDecorator('id')
    static readonly primaryKey: Query.HashPrimaryKey<Card, number>;
  }

  let primaryKey: HashPrimaryKey<Card, number>;

  beforeEach(async () => {
    await Card.createTable();

    primaryKey = new HashPrimaryKey<Card, number>(
      Card,
      Card.metadata.primaryKey as Metadata.Indexes.HashPrimaryKeyMetadata
    );
  });

  afterEach(async () => {
    await Card.dropTable();
  });

  describe("#delete", async () => {
    it("should delete item if exist", async () => {
      await Card.metadata.connection.documentClient.put({
        TableName: Card.metadata.name,
        Item: {
          id: 10,
          title: "abc",
        }
      }).promise();

      await primaryKey.delete(10);
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
        (item) => item.id
      ).map(c => c.id);

      expect(ids).to.deep.eq( _.sortBy(cards.map(c => c.id), i => i) );
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

      const result1 = (await primaryKey.batchGet(cards.map(c => c.id))).records;

      // it should keep the order
      expect(result1.map(c => c.id)).to.deep.eq(cards.map(c => c.id));
    });
  });
});