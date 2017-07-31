import {
  createDocumentClient,
  createClient,
} from './dynamo-client';


export const client = createClient();
export const documentClient = createDocumentClient();

