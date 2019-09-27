import { ITable } from "../table";

export function HashPrimaryKey(hashKeyName: string) {
  return (tableClass: ITable<any>, propertyKey: string) => {
    const hash = tableClass.metadata.attributes.find((attr) => attr.name === hashKeyName);
    if (!hash) {
      throw new Error(`Given hashKey ${hashKeyName} is not declared as attribute`);
    }

    tableClass.metadata.primaryKey = {
      type: "HASH",
      hash,
      name: propertyKey,
    };
  };
}
