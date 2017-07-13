import { TableMetadata } from '../metadata/table';

export interface Table {
  metadata: TableMetadata;
}

export function Table(options: TableOptions) {
  return (target: Function) => {
    (target as any as Table).metadata = new TableMetadata(target, options);
  };
}

export interface TableOptions {
  name: string;
}