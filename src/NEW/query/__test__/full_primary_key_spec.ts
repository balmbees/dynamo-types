import * as chai from 'chai';
const expect = chai.expect;

import { Table } from '../../table';
import * as Metadata from '../../metadata';
import { FullPrimaryKey } from '../full_primary_key';

class Card extends Table {
  public id: number;
  public title: string;
}

const CardMetadata: Metadata.Table.Metadata = {
  name: "Card",
  attributes: [
    {
      name: 'id',
      type: Metadata.Attribute.Type.Number,
    }, {
      name: 'title',
      type: Metadata.Attribute.Type.String,
    },
  ],
  primaryKey: {
    type: 'FULL',
    hash: {
      name: 'id',
      type: Metadata.Attribute.Type.Number,
    },
    range: {
      name: 'title',
      type: Metadata.Attribute.Type.String,
    }
  }
};

describe("PrimaryKey", () => {
  const primaryKey = new FullPrimaryKey<Card, number, string>(
    Card, CardMetadata, CardMetadata.primaryKey as Metadata.Indexes.FullPrimaryKeyMetadata
  );

  describe("#get", async () => {
    it("should find item", () => {
      primaryKey.get(10, "abc");
    });
  });

  describe("#query", async () => {
    it("should find items", () => {

    });
  });
});