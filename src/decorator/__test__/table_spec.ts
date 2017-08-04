import * as chai from 'chai';
const expect = chai.expect;

import { Table as TableDecorator } from '../table';
import { Attribute as AttributeDecorator } from '../attribute';
import { FullPrimaryKey as FullPrimaryKeyDecorator } from '../full_primary_key';
import { Writer as WriterDecorator } from '../writer';

import * as Query from '../../query';


import { Table } from '../../table';

@TableDecorator({ name: "prod-Card1" })
class Card extends Table {
  @AttributeDecorator()
  public id: number;

  @AttributeDecorator()
  public title: string;

  @AttributeDecorator({ name: "complicated_field"})
  public complicatedField: string;

  @FullPrimaryKeyDecorator('id', 'title')
  static readonly primaryKey: Query.FullPrimaryKey<Card, number, string>;

  @WriterDecorator()
  static readonly writer: Query.Writer<Card>;
}

describe("Table Decorator", () => {
  it("should build table metadata", () => {
    expect(Card.metadata.name).eq("prod-Card1");
  });

  it("should create primaryKey", () => {
    expect(Card.primaryKey).to.be.instanceof(Query.FullPrimaryKey);
  });

  it("should have writer", () => {
    expect(Card.writer).to.be.instanceof(Query.Writer);
  });

  it("should have attributes properties", () => {
    const card = new Card();
    card.id = 10;
    card.title = "100";

    card.complicatedField = "data";
    expect(card.getAttribute("complicated_field")).to.eq("data");

    card.setAttribute("complicated_field", "data2");
    expect(card.complicatedField).to.eq("data2");
  });
});