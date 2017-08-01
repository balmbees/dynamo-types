import * as chai from 'chai';
const expect = chai.expect;

import { Table } from '../../table';
import * as Metadata from '../../metadata';

import { FullPrimaryKey } from '../full_primary_key';

import {
  Table as TableDecorator,
  Attribute as AttributeDecorator,
  FullPrimaryKey as FullPrimaryKeyDecorator,
} from '../../decorator';

import * as TableOperations from '../table_operations';
import * as Query from '../index';
import Config from '../../config';

@TableDecorator({ name: "prod-Card" })
class Card extends Table {
  @AttributeDecorator()
  public id: number;

  @AttributeDecorator()
  public title: string;

  @FullPrimaryKeyDecorator('id', 'title')
  static readonly primaryKey: Query.FullPrimaryKey<Card, number, string>;
}

describe("FullPrimaryKey", () => {
  let primaryKey: FullPrimaryKey<Card, number, string>;

  beforeEach(async() => {
    await TableOperations.createTable(Card.metadata, Config.client);

    primaryKey = new FullPrimaryKey<Card, number, string>(
      Card,
      Card.metadata.primaryKey as Metadata.Indexes.FullPrimaryKeyMetadata,
      Config.documentClient
    );
  });

  afterEach(async () => {
    await TableOperations.dropTable(Card.metadata, Config.client);
  });

  describe("#get", async () => {
    it("should find item", async () => {
      const item = await primaryKey.get(10, "abc");
      expect(item).to.be.null;
    });

    it("should find item", async () => {
      await Config.documentClient.put({
        TableName: Card.metadata.name,
        Item: {
          id: 10,
          title: "abc",
        }
      }).promise();
      const item = await primaryKey.get(10, "abc");
      expect(item).to.be.instanceof(Card);
      expect(item!.id).to.eq(10);
      expect(item!.title).to.eq("abc");
    });
  });

  describe("#bacthGet", async () => {
    it("should find items", async () => {
      await Config.documentClient.put({
        TableName: Card.metadata.name,
        Item: {
          id: 10,
          title: "abc",
        }
      }).promise();
      await Config.documentClient.put({
        TableName: Card.metadata.name,
        Item: {
          id: 11,
          title: "abc",
        }
      }).promise();
      await Config.documentClient.put({
        TableName: Card.metadata.name,
        Item: {
          id: 12,
          title: "abc",
        }
      }).promise();

      const items = (await primaryKey.batchGet([ [10, "abc"], [11, "abc"] ])).records;
      expect(items.length).to.eq(2);
      expect(items[0].id).to.eq(10);
      expect(items[1].id).to.eq(11);
    });
  });


  describe("#query", () => {
    it("should find items", async () => {
      await Config.documentClient.put({
        TableName: Card.metadata.name,
        Item: {
          id: 10,
          title: "abc",
        }
      }).promise();
      await Config.documentClient.put({
        TableName: Card.metadata.name,
        Item: {
          id: 10,
          title: "abd",
        }
      }).promise();
      await Config.documentClient.put({
        TableName: Card.metadata.name,
        Item: {
          id: 10,
          title: "aba",
        }
      }).promise();

      const res = await primaryKey.query({
        hash: 10,
        range: ["between", "abc", "abf"]
      });

      console.log(res);
      expect(res.records.length).to.eq(2);
      expect(res.records[0].title).to.eq("abc");
      expect(res.records[1].title).to.eq("abd");
    });
  });
});