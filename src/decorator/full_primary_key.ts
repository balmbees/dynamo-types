import * as Metadata from '../metadata';
import { Table, ITable } from '../table';

import * as _ from 'lodash';

export function FullPrimaryKey(hashKeyName: string, rangeKeyName: string) {
  return (tableClass: ITable<any>, propertyKey: string) => {
    const hash = _.find(tableClass.metadata.attributes, (attr) => attr.name === hashKeyName);
    if (!hash)
      throw new Error(`Given hashKey ${hashKeyName} is not declared as attribute`);

    const range = _.find(tableClass.metadata.attributes, (attr) => attr.name === rangeKeyName);
    if (!range)
      throw new Error(`Given hashKey ${rangeKeyName} is not declared as attribute`);

    tableClass.metadata.primaryKey = {
      type: 'FULL',
      hash,
      name: propertyKey,
      range
    };
  }
}
