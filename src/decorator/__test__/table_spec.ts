import { expect } from "chai";

import { Attribute as AttributeDecorator } from "../attribute";
import { FullPrimaryKey as FullPrimaryKeyDecorator } from "../full_primary_key";
import { Table as TableDecorator } from "../table";
import { Writer as WriterDecorator } from "../writer";

import * as Query from "../../query";

import { Table } from "../../table";

@TableDecorator({ name: "prod-Card1" })
class Card extends Table {
  @FullPrimaryKeyDecorator("id", "title")
  public static readonly primaryKey: Query.FullPrimaryKey<Card, number, string>;

  @WriterDecorator()
  public static readonly writer: Query.Writer<Card>;

  @AttributeDecorator()
  public id: number;

  @AttributeDecorator()
  public title: string;

  @AttributeDecorator({ name: "complicated_field"})
  public complicatedField: string;
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
