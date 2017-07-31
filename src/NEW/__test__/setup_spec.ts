require("reflect-metadata");



var dynamoLocal = require('dynamo-local');
// dynamoLocal({port: 8000, dbPath: '.'}, function (err) { /* ... */ });

process.env.AWS_REGION = "us-east-1"; // Mock
process.env.AWS_ACCESS_KEY_ID = "mock-access-key-id";
process.env.AWS_SECRET_ACCESS_KEY = "mock-secret-access-key"
process.env.DYNAMO_TYPES_ENDPOINT = 'http://127.0.0.1:8000';

//   before(async () => {
//   await new Promise((resolve, reject) => {
//     dynamoLocal({port: 8000, dbPath: '.'}, function (err: Error) {
//       if (err) reject(err);
//       else resolve();
//     });
//   });

// });