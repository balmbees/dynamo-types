import { Table, ITable } from '../table';

export function serialize<T extends Table>(tableClass: ITable<T>, record: T): { [key:string]: any } {
  const res: { [key:string]: any } = {};

  tableClass.metadata.attributes.forEach(attributeMetadata => {
    const attr = record.getAttribute(attributeMetadata.name);
    if (attr !== undefined) {
      res[attributeMetadata.name] = attr;
    }
  });

  return res;
}
