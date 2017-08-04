import * as chai from 'chai';
const expect = chai.expect;

import { Table } from '../../table';
import * as Metadata from '../../metadata';

import { HashPrimaryKey } from '../hash_primary_key';

import {
  Table as TableDecorator,
  Attribute as AttributeDecorator,
  HashPrimaryKey as HashPrimaryKeyDecorator,
} from '../../decorator';

import * as Query from '../index';
import Config from '../../config';


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
      Card.metadata.primaryKey as Metadata.Indexes.HashPrimaryKeyMetadata,
      Config.documentClient
    );
  });

  afterEach(async () => {
    await Card.dropTable();
  });

  describe("#delete", async () => {
    it("should delete item if exist", async () => {
      await Config.documentClient.put({
        TableName: Card.metadata.name,
        Item: {
          id: 10,
          title: "abc",
        }
      }).promise();

      await primaryKey.delete(10);
    });
  });
});