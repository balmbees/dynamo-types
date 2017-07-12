import { TableMetadata } from '../metadata/table';

export interface Table {
  metadata: TableMetadata;
}

export function Table(options: TableOptions) {
  return (target: Table) => {
    target.metadata = new TableMetadata(target, options);
  };
}

export interface TableOptions {
  name: string;
}