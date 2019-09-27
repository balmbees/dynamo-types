import { DynamoDB } from "aws-sdk";
import * as _ from "lodash";
import {
  Attribute as AttributeMetadata,
  Table as TableMetadata,
} from "../metadata";
import { ITable, Table } from "../table";

import * as AttributeValue from "./attribute_value";

export function deserialize<T extends Table>(
  tableClass: ITable<T>,
  dynamoAttributes: DynamoDB.DocumentClient.AttributeMap,
): T {
  const record = new tableClass();

  tableClass.metadata.attributes.forEach((attributeMetadata) => {
    const attributeValue = dynamoAttributes[attributeMetadata.name];
    if (!dynamoAttributes.hasOwnProperty(attributeMetadata.name)) {
      // attribute is defined but not provided by DynamoDB
      // raise error but maybe later?
      return;
    } else {
      record.setAttribute(attributeMetadata.name, attributeValue);
    }
  });

  return record;
}

export function unmarshal<T extends Table>(
  tableClass: ITable<T>,
  dynamoAttributes: DynamoDB.AttributeMap,
): T {
  const result = DynamoDB.Converter.unmarshall(dynamoAttributes);
  _.map(result, (val, key) => {
    if (val !== null && typeof(val) === "object" && val.values && val.type) {
      result[key] = val.values;
    }
  });
  return deserialize(tableClass, result);
}
