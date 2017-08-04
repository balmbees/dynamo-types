import * as chai from 'chai';
const expect = chai.expect;

import { deserialize } from '../deserialize';
import * as Metadata from '../../metadata';

import { Table } from '../../table';

class Card extends Table {
  public id: number;
}
(Card as any).metadata = {
  name: "card",
  attributes: [{
    name: "id",
    type: Metadata.Attribute.Type.Number,
  }],
  primaryKey: {
    type: "HASH",
    hash: {
      name: "id",
      type: Metadata.Attribute.Type.Number,
    },
  }
}

class Falsy extends Table {
  public foo: number;
  public bar: boolean;
  public baz: null;
  public baq: string;
}
(Falsy as any).metadata = {
  name: "falsy",
  attributes: [{
    name: "foo",
    type: Metadata.Attribute.Type.Number,
  }, {
    name: "bar",
    type: Metadata.Attribute.Type.Boolean,
  }, {
    name: "baz",
    type: Metadata.Attribute.Type.Null,
  }, {
    name: "baq",
    type: Metadata.Attribute.Type.String,
  }],
  primaryKey: {
    type: "HASH",
    hash: {
      name: "foo",
      type: Metadata.Attribute.Type.Number,
    },
  }
}

describe("#deserialize", () => {
  it("should deserialize data", () => {
    const record = deserialize(
      Card,
      {
        id: 10,
      }
    );

    expect(record.getAttribute("id")).to.eq(10);
  });

  it("should preserve falsy values", () => {
    const record = deserialize(
      Falsy,
      {
        foo: 0,
        bar: false,
        baz: null,
        baq: "",
      }
    );

    expect(record.getAttribute("foo")).to.be.eq(0);
    expect(record.getAttribute("bar")).to.be.eq(false);
    expect(record.getAttribute("baz")).to.be.eq(null);
    expect(record.getAttribute("baq")).to.be.eq("");
  });
});