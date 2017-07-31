import * as Metadata from '../metadata';
import { ITable } from '../table';
import * as Query from '../query';
import * as Config from '../config';

// Table Decorator
export function Table(options: { name?: string } = {}) {
  return (target: ITable<any>) => {
    target.metadata.name = options.name || target.name;

    // Table Decorator Executed at last,
    // So Validate metadata, presume all the setups are finisehd
    Metadata.Table.validateMetadata(target.metadata);

    // After validation, setup some methods.
    defineAttributeProperties(target);
    definePrimaryKeyProperty(target);
  };
}

function defineAttributeProperties(table: ITable<any>) {
  table.metadata.attributes.forEach(attr => {
    Object.defineProperty(
      table.prototype,
      attr.name,
      {
        get: function() {

        },
        set: function(v) {

        },
      }
    );
  });
}

function definePrimaryKeyProperty(table: ITable<any>) {
  if (table.metadata.primaryKey) {
    const pkMetdata = table.metadata.primaryKey;
    if (pkMetdata.type === "FULL") {
      Object.defineProperty(
        table,
        pkMetdata.name,
        {
          value: new Query.FullPrimaryKey(table, pkMetdata, Config.documentClient),
          writable: false,
        }
      );
    } else {
      Object.defineProperty(
        table,
        pkMetdata.name,
        {
          value: new Query.HashPrimaryKey(table, pkMetdata, Config.documentClient),
          writable: false,
        }
      );
    }
  }
}
