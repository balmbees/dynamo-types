import {
  Table as TableMetadata,
  Attribute as AttributeMetadata,
} from '../metadata';
import { Table, ITable } from '../table';
import { DynamoDB } from 'aws-sdk';

import * as AttributeValue from './attribute_value';

export function serialize<T extends Table>(tableClass: ITable<T>, record: T): { [key:string]: any } {
  const res: { [key:string]: any } = {};

  tableClass.metadata.attributes.forEach(attributeMetadata => {
    const attr = record.getAttribute(attributeMetadata.name);
    if (attr) {
      res[attributeMetadata.name] = attr;
    }
  });

  return res;
}
