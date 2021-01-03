import { expect } from "chai";

import { Attribute } from "../../metadata";
import { StringSet } from "../../metadata/attribute";
import * as AttributeValue from "../attribute_value";

describe("AttributeValue.parse", () => {
  it("should parse number", () => {
    expect(AttributeValue.parse({
      N: "10",
    })).to.deep.eq({ value: 10, type: Attribute.Type.Number});
  });

  it("should parse string", () => {
    expect(AttributeValue.parse({
      S: "10",
    })).to.deep.eq({ value: "10", type: Attribute.Type.String});
  });

  it("should parse buffer", () => {
    expect(AttributeValue.parse({
      B: "xx",
    })).to.deep.eq({ value: "xx", type: Attribute.Type.Buffer});
  });

  it("should parse array", () => {
    expect(AttributeValue.parse({
      L: [
        { S: "10" },
        { N: "20" },
        { L: [
            { BOOL: false },
          ] },
      ],
    })).to.deep.eq({ value: [
      "10",
      20,
      [
        false,
      ],
    ], type: Attribute.Type.Array});
  });

  it("should parse map", () => {
    expect(AttributeValue.parse({
      M: {
        a: { S: "10" },
        b: { N: "20" },
        c: { L: [
            { BOOL: false },
          ] },
      },
    })).to.deep.eq({ value: {
      a: "10",
      b: 20,
      c: [
        false,
      ],
    }, type: Attribute.Type.Map});
  });

  it("should parse string set", () => {
    const beforeParse = {
      SS: [
        "test",
        "string",
        "set",
      ],
    };

    const afterParse = AttributeValue.parse(beforeParse);

    expect(afterParse.type).to.eq(Attribute.Type.StringSet);
    expect(afterParse.value).to.be.deep.eq(["test", "string", "set"]);
  });

  it("should parse number set", () => {
    const beforeParse = {
      NS: [
        "1",
        "0.5",
        "0.9",
      ],
    };

    const afterParse = AttributeValue.parse(beforeParse);

    expect(afterParse.type).to.eq(Attribute.Type.NumberSet);
    expect(afterParse.value).to.be.deep.eq(["1", "0.5", "0.9"]);
  });

});
