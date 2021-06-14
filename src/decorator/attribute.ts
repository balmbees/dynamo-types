import "reflect-metadata";

import { Attribute as AttributeMetadata } from "../metadata";
import { NumberSet, StringSet } from "../metadata/attribute";
import { ITable, Table } from "../table";

// Table Decorator
export function Attribute<T>(options: { name?: string, timeToLive?: true, type?: AttributeMetadata.Type } = {}) {
  return (record: Table, propertyName: string) => {
    const tableClass = (record.constructor as ITable<any>);
    const nativeType = Reflect.getMetadata("design:type", record, propertyName);

    tableClass.metadata.attributes.push(
      {
        name: options.name || propertyName,
        propertyName,
        timeToLive: options.timeToLive,
        type: options.type ?? _nativeTypeToAttributeMetadataType(nativeType),
      },
    );
  };
}

function _nativeTypeToAttributeMetadataType(nativeType: any) {
  if (nativeType === String) {
    return AttributeMetadata.Type.String;
  } else if (nativeType === Number) {
    return AttributeMetadata.Type.Number;
  } else if (nativeType === Boolean) {
    return AttributeMetadata.Type.Boolean;
  } else if (nativeType === Array) {
    return AttributeMetadata.Type.Array;
  } else if (nativeType === Object) {
    return AttributeMetadata.Type.Map;
  } else if (nativeType === StringSet) {
    return AttributeMetadata.Type.StringSet;
  } else if (nativeType === NumberSet) {
    return AttributeMetadata.Type.NumberSet;
  } else {
    throw new Error(`Unsupported type ${nativeType}`);
  }
}
