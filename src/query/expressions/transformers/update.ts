import * as _ from "lodash";
import Config from "../../../config";

import * as Metadata from "../../../metadata";
import { NumberSet, StringSet } from "../../../metadata/attribute";
import { UpdateAction, UpdateChanges } from "../update";

const UPDATE_NAME_REF_PREFIX = "#uk";
const UPDATE_VALUE_REF_PREFIX = ":uv";

const ACTION_TOKEN_MAP = new Map<UpdateAction, string>([
  ["PUT", "SET"],
  ["ADD", "ADD"],
  ["APPEND", "SET"],
  ["DELETE", "DELETE"],
  ["REMOVE", "REMOVE"],
]);

export function buildUpdate<T>(
  metadata: Metadata.Table.Metadata,
  changes: UpdateChanges<T>,
) {
  const keyRef = new Map<string, string>();
  const valueRef = new Map<string, any>();
  const client = metadata.connection.documentClient;

  const keyNameCache = new Map<string, string>(metadata.attributes.map((attr) => [attr.propertyName, attr.name]));

  const expr = _(changes)
    .map((change, key) => ({ name: keyNameCache.get(key), action: change![0], value: change![1] }))
    .filter((change) => change.name !== undefined)
    .groupBy((change) => change.action)
    .map((groupedChanges, action: UpdateAction) => {
      const actions = groupedChanges.map((change) => {

        const keyPath = `${UPDATE_NAME_REF_PREFIX}${keyRef.size}`;
        const valuePath = `${UPDATE_VALUE_REF_PREFIX}${valueRef.size}`;

        if (action !== "REMOVE") {
          keyRef.set(keyPath, change.name!);

          if (change.value instanceof StringSet || change.value instanceof NumberSet) {
            valueRef.set(valuePath, client.createSet(change.value.toArray()));
          } else {
            valueRef.set(valuePath, change.value);
          }
        }

        switch (action) {
          case "PUT":
            return `${keyPath} = ${valuePath}`;
          case "ADD":
          case "DELETE":
            return `${keyPath} ${valuePath}`;
          case "APPEND": {
            valueRef.set(":empty_list", []);
            return `${keyPath} = list_append(if_not_exists(${keyPath}, :empty_list), ${valuePath})`;
          }
          case "REMOVE":
            return `${change.name}`;
        }
      });

      return `${ACTION_TOKEN_MAP.get(action)!} ${actions.join(", ")}`;
    })
    .join(" ");

  const attributeNames = keyRef.size > 0 ?
    Array.from(keyRef.entries()).reduce((hash, [key, val]) => ({
      ...hash,
      [key]: val,
    }), {}) :
    undefined;

  const attributeValues = valueRef.size > 0 ?
      Array.from(valueRef.entries()).reduce((hash, [key, val]) => ({
        ...hash,
        [key]: val,
      }), {}) :
      undefined;

  const operation = {
    UpdateExpression: expr,
    ExpressionAttributeNames: attributeNames ? _.omitBy(attributeNames, _.isUndefined) : attributeNames,
    ExpressionAttributeValues: attributeValues ? _.omitBy(attributeValues, _.isUndefined) : attributeValues,
  };

  return _.omitBy(operation, _.isUndefined);
}
