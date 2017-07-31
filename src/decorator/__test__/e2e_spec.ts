import * as chai from 'chai';
const expect = chai.expect;

import { Table as TableDecorator } from '../table';
import { Attribute as AttributeDecorator } from '../attribute';
import { FullPrimaryKey as FullPrimaryKeyDecorator } from '../full_primary_key';

import * as Query from '../../query';


import { Table } from '../../table';

@TableDecorator({ name: "prod-Card" })
class Card extends Table {
  @AttributeDecorator()
  public id: number;

  @AttributeDecorator()
  public title: string;

  @FullPrimaryKeyDecorator('id', 'title')
  static readonly primaryKey: Query.FullPrimaryKey<Card, number, string>;
}

describe.only("Table Decorator", () => {
  it("should build table metadata", () => {
    expect(Card.metadata.name).eq("prod-Card");
  });

  it("should create primaryKey", () => {
    expect(Card.primaryKey).to.be.instanceof(Query.FullPrimaryKey);
  });

  it("should have attributes properties", () => {
    const card = new Card();
    card.id = 10;
    card.title = "100";
    console.log(card);
  });
});