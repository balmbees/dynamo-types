import {
  Table as TableMetadata,
  Attribute as AttributeMetadata,
} from '../metadata';
import { Table, ITable } from '../table';
import { DynamoDB } from 'aws-sdk';

import * as AttributeValue from './attribute_value';

export function deserialize<T extends Table>(
  tableClass: ITable<T>,
  dynamoAttributes: DynamoDB.DocumentClient.AttributeMap
): T {
  const record = new tableClass();

  tableClass.metadata.attributes.forEach(attributeMetadata => {
    const attributeValue = dynamoAttributes[attributeMetadata.name];
    if (!attributeValue) {
      // attribute is defined but not provided by DynamoDB
      // raise error but maybe later?
      return;
    } else {
      record.setAttribute(attributeMetadata.name, attributeValue);
    }
  });

  return record;
}
