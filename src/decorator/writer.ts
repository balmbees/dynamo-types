import { ITable } from '../table';
import * as Query from '../query';

// Writer is pretty much "Helper" method.
// You can still create writer without this decorator, but it seems pretty clear people would need writer for most of classes anyway

export function Writer() {
  return (tableClass: ITable<any>, propertyKey: string) => {
    Object.defineProperty(
      tableClass,
      propertyKey,
      {
        value: new Query.Writer(tableClass),
        writable: false,
      }
    );
  }
}
