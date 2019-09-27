import { DynamoDB } from "aws-sdk";
import * as Attribute from "../metadata/attribute";

import * as _ from "lodash";

// It extracts value with type, such as 'S"
export function parse(v: DynamoDB.AttributeValue) {
  if (v.B !== undefined) {
    // Buffer|Uint8Array|Blob|string;
    if (typeof v.B !== "string") {
      throw new Error("DynamoTypes doesn't support B attribute that is not string");
    }
    return { value: v.B, type: Attribute.Type.Buffer };
  } else if (v.BOOL !== undefined) {
    return { value: v.BOOL, type: Attribute.Type.Boolean };
  } else if (v.L !== undefined) {
    const list: any[] = v.L.map((i) => parse(i).value);
    return { value: list, type: Attribute.Type.Array };
  } else if (v.M !== undefined) {
    const map: { [key: string]: any} = _.mapValues(v.M, (i) => parse(i).value);
    return { value: map, type: Attribute.Type.Map };
  } else if (v.N !== undefined) {
    return { value: Number(v.N), type: Attribute.Type.Number };
  } else if (v.S !== undefined) {
    return { value: v.S, type: Attribute.Type.String };
  } else if (v.NULL !== undefined) {
    return { value: null, type: Attribute.Type.Null };
  } else {
    throw Error(`Can't parse value: ${JSON.stringify(v)}`);
  }
}
