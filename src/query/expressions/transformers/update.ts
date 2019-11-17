import * as _ from "lodash";

import * as Metadata from "../../../metadata";
import { UpdateAction, UpdateChanges } from "../update";

const UPDATE_NAME_REF_PREFIX = "#uk";
const UPDATE_VALUE_REF_PREFIX = ":uv";

const ACTION_TOKEN_MAP = new Map<UpdateAction, string>([
  ["PUT", "SET"],
  ["ADD", "ADD"],
  ["DELETE", "DELETE"],
]);

export function buildUpdate<T>(
  metadata: Metadata.Table.Metadata,
  changes: UpdateChanges<T>,
) {
  const keyRef = new Map<string, string>();
  const valueRef = new Map<string, any>();

  const keyNameCache = new Map<string, string>(metadata.attributes.map((attr) => [attr.propertyName, attr.name]));

  const expr = _(changes)
    .map((change, key) => ({ name: keyNameCache.get(key), action: change![0], value: change![1] }))
    .filter((change) => change.name !== undefined)
    .groupBy((change) => change.action)
    .map((groupedChanges, action: UpdateAction) => {
      const actions = groupedChanges.map((change) => {
        const keyPath = `${UPDATE_NAME_REF_PREFIX}${keyRef.size}`;
        keyRef.set(keyPath, change.name!);

        const valuePath = `${UPDATE_VALUE_REF_PREFIX}${valueRef.size}`;
        valueRef.set(valuePath, change.value);

        switch (action) {
          case "PUT":
            return `${keyPath} = ${valuePath}`;
          case "ADD":
          case "DELETE":
            return `${keyPath} ${valuePath}`;
        }
      });

      return `${ACTION_TOKEN_MAP.get(action)!} ${actions.join(", ")}`;
    })
    .join(" ");

  return {
    UpdateExpression: expr,
    ExpressionAttributeNames: keyRef.size > 0 ?
      Array.from(keyRef.entries()).reduce((hash, [key, val]) => ({
        ...hash,
        [key]: val,
      }), {}) :
      undefined,
    ExpressionAttributeValues: valueRef.size > 0 ?
      Array.from(valueRef.entries()).reduce((hash, [key, val]) => ({
        ...hash,
        [key]: val,
      }), {}) :
      undefined,
  };
}
