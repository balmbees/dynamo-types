import { ITable } from '../table';

export function FullGlobalSecondaryIndex(
  hashKeyName: string, rangeKeyName: string, options: { name?: string; } = {}
) {
  return (tableClass: ITable<any>, propertyName: string) => {
    const hash = tableClass.metadata.attributes.find(attr => attr.name === hashKeyName);
    if (!hash)
      throw new Error(`Given hashKey ${hashKeyName} is not declared as attribute`);

    const range = tableClass.metadata.attributes.find(attr => attr.name === rangeKeyName);
    if (!range)
      throw new Error(`Given hashKey ${rangeKeyName} is not declared as attribute`);

    tableClass.metadata.globalSecondaryIndexes.push({
      type: "FULL",
      name: options.name || propertyName,
      propertyName,
      hash,
      range,
    });
  }
}

export function HashGlobalSecondaryIndex(
  hashKeyName: string, options: { name?: string; } = {}
) {
  return (tableClass: ITable<any>, propertyName: string) => {
    const hash = tableClass.metadata.attributes.find(attr => attr.name === hashKeyName);
    if (!hash)
      throw new Error(`Given hashKey ${hashKeyName} is not declared as attribute`);

    tableClass.metadata.globalSecondaryIndexes.push({
      type: "HASH",
      name: options.name || propertyName,
      propertyName,
      hash,
    });
  }
}
