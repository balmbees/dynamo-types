import * as Metadata from '../metadata';
import { Table, ITable } from '../table';

import * as _ from 'lodash';

export function HashPrimaryKey(hashKeyName: string) {
  return (tableClass: ITable<any>, propertyKey: string) => {
    const hash = _.find(tableClass.metadata.attributes, (attr) => attr.name === hashKeyName);
    if (!hash)
      throw new Error(`Given hashKey ${hashKeyName} is not declared as attribute`);

    tableClass.metadata.primaryKey = {
      type: 'HASH',
      hash,
      name: propertyKey,
    };
  }
}
