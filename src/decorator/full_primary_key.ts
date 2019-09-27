import { ITable } from "../table";

export function FullPrimaryKey(hashKeyName: string, rangeKeyName: string) {
  return (tableClass: ITable<any>, propertyKey: string) => {
    const hash = tableClass.metadata.attributes.find((attr) => attr.name === hashKeyName);
    if (!hash) {
      throw new Error(`Given hashKey ${hashKeyName} is not declared as attribute`);
    }

    const range = tableClass.metadata.attributes.find((attr) => attr.name === rangeKeyName);
    if (!range) {
      throw new Error(`Given hashKey ${rangeKeyName} is not declared as attribute`);
    }

    tableClass.metadata.primaryKey = {
      type: "FULL",
      hash,
      name: propertyKey,
      range,
    };
  };
}
