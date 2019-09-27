import { expect } from "chai";

import { Attribute } from "../../metadata";
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

});
