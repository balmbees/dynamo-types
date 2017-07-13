// Base Table
export class Table {

}

export interface ITable<T extends Table> {
  new(): T;
}
