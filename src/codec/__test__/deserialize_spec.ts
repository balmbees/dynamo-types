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

describe("#deserialize", () => {
  it("should deserialize data", () => {
    const record = deserialize(
      Card,
      {
        id: 10,
      }
    );

    expect(record.id).to.eq(10);
  });
});