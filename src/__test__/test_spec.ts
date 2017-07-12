
import * as chai from 'chai';

import {
  Table,
  Attribute,
  DynamoTable,
  StaticHelper
} from '../index';

@Table("prod_word")
export class Word extends DynamoTable{
  static readonly Static = new StaticHelper(Word);

  @Attribute({ keyType: "hash" })
  word: string;

  @Attribute({ keyType: "range" })
  createdAt: Date;
}

describe("Complex Text", () => {
  it("should work", () => {
    const word = new Word();
    word.word = "XXX";
    word.createdAt = new Date();


    Word.Static.put()
  });
});