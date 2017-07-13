// import { AttributeType } from '../metadata/attribute';
// import { TableIndexMetadata } from '../metadata/table';

// import { Table } from '../decorators/table';

// export interface TableAccessorOptions {
//   table: Table;
//   index: TableIndexMetadata;
// }

// import * as AWS from "aws-sdk";

// export class TableAccessor {
//   private documentClient = new AWS.DynamoDB.DocumentClient();

//   constructor(private options: TableAccessorOptions) {}

//   private get tableMetadata() {
//     return this.options.table.metadata;
//   }

//   async scan(options: { Limit?: number }) {
//     const res =
//       await this.documentClient
//         .scan({
//           TableName: this.tableMetadata.tableName,
//           Limit: options.Limit,
//         })
//         .promise();
//     return this.options.table.fromItems(res.Items || []);
//   }

//   async batchGet(keyList: AWS.DynamoDB.KeyList) {
//     const res = await this.documentClient
//                   .batchGet({
//                     RequestItems: {
//                       [this.tableMetadata.tableName]: {
//                         Keys: keyList,
//                       }
//                     }
//                   })
//                   .promise();

//     return this.options.table.fromItems((res.Responses || {})[this.tableMetadata.tableName] || []);
//   }

//   async batchPut(items: Table[]) {
//     const res = await this.documentClient
//                   .batchWrite({
//                     RequestItems: {
//                       [this.tableMetadata.tableName]: items.map(item => {
//                         return {
//                           PutRequest: {
//                             Item: item,
//                           }
//                         };
//                       }),
//                     }
//                   })
//                   .promise();

//     return this.options.table.fromItems(items);

//   }

//   async put(item: Table) {
//     const res = await this.documentClient
//                   .put({
//                     TableName: this.tableMetadata.tableName,
//                     Item: item,
//                   })
//                   .promise();

//     return this.options.table.fromItem(res.Attributes || []);
//   }
// }
