var dynamoLocal = require('dynamo-local');
// dynamoLocal({port: 8000, dbPath: '.'}, function (err) { /* ... */ });

before(async () => {
  await new Promise((resolve, reject) => {
    dynamoLocal({port: 8000, dbPath: '.'}, function (err: Error) {
      if (err) reject(err);
      else resolve();
    });
  });
});