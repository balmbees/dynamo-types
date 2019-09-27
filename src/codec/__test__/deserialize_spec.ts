import { expect } from "chai";

import * as Metadata from "../../metadata";
import { deserialize, unmarshal } from "../deserialize";

import { Table } from "../../table";

// tslint:disable:max-classes-per-file
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
  },
};

class Falsy extends Table {
  public foo: number;
  public bar: boolean;
  public baz: null;
  public baq: string;
  public vin: number[];
  public gle: string[];
  public qqq: object;
}
// tslint:enable:max-classes-per-file

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
  }, {
    name: "vin",
    type: Metadata.Attribute.Type.Array,
  }, {
    name: "gle",
    type: Metadata.Attribute.Type.Array,
  }, {
    name: "qqq",
    type: Metadata.Attribute.Type.Map,
  }],
  primaryKey: {
    type: "HASH",
    hash: {
      name: "foo",
      type: Metadata.Attribute.Type.Number,
    },
  },
};

describe("#deserialize", () => {
  it("should deserialize data", () => {
    const record = deserialize(
      Card,
      {
        id: 10,
      },
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
      },
    );

    expect(record.getAttribute("foo")).to.be.eq(0);
    expect(record.getAttribute("bar")).to.be.eq(false);
    expect(record.getAttribute("baz")).to.be.eq(null);
    expect(record.getAttribute("baq")).to.be.eq("");
  });
});

describe("#unmarshal", () => {
  it("should unmarshal data", () => {
    const record = unmarshal(
      Card,
      {
        id: {
          N: "10",
        },
      },
    );

    expect(record.getAttribute("id")).to.eq(10);
  });

  it("should preserve falsy values", () => {
    const record = unmarshal(
      Falsy,
      {
        foo: {
          N: "0",
        },
        bar: {
          BOOL: false,
        },
        baz: {
          NULL: true,
        },
        baq: {
          S: "",
        },
        vin: {
          NS: ["1", "2", "3"],
        },
        gle: {
          SS: ["hello", "world"],
        },
        qqq: {
          M: {
            id: {
              N: "12312",
            },
          },
        },
      },
    );

    expect(record.getAttribute("foo")).to.be.eq(0);
    expect(record.getAttribute("bar")).to.be.eq(false);
    expect(record.getAttribute("baz")).to.be.eq(null);
    expect(record.getAttribute("baq")).to.be.eq("");
    expect(record.getAttribute("vin")).to.be.deep.eq([1, 2, 3]);
    expect(record.getAttribute("gle")).to.be.deep.eq(["hello", "world"]);
    expect(record.getAttribute("qqq")).to.be.deep.eq({ id: 12312 });
  });
});
