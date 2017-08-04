[![Travis Build Status](https://travis-ci.org/breath103/dynamo-typeorm.svg?branch=master)](https://travis-ci.org/breath103/dynamo-typeorm)
[![npm version](https://badge.fury.io/js/dynamo-types.svg)](https://badge.fury.io/js/dynamo-types)

# DynamoTypes
Typescript ORM of DynamoDB, written from scrach to fully support the DynamoDB

## Features
1. DynamoDB record -> TS Class object with typing
2. CreateTable / DropTable
3. PrimaryKey 
   - FullPrimaryKey (Hash, Range)
   - HashPrimaryKey (Hash)
4. Attribute
   - Type Support (Number / String / Boolean / Array / Object / Buffer)
   - TimeToLive
   
## Usage
```typescript
  @Decorator.Table({ name: "prod-Card" })
  class Card extends Table {
    @Decorator.Attribute()
    public id: number;

    @Decorator.Attribute()
    public title: string;
    
    @Decorator.Attribute({ timeToLive: true })
    public expiresAt: number;

    @Decorator.FullPrimaryKey('id', 'title')
    static readonly primaryKey: Query.FullPrimaryKey<Card, number, string>;

    @Decorator.Writer()
    static readonly writer: Query.Writer<Card>;
  }

  // Create Table At DynamoDB
  await Card.createTable();

  // Drop Table At DynamoDB
  await Card.dropTable();


  // Creating Record
  const card = new Card();
  card.id = 100;
  card.title = "Title";
  // 
  await Card.writer.put(card);
  // OR just
  await card.save();

  // Batch Put
  await Card.writer.batchPut([
    new Card(),
    new Card()
  ]);

  // Get Record
  await Card.primaryKey.get(100, "Title");

  // BatchGet
  // This array's are strongly typed, so don't worry.
  await Card.primaryKey.batchGet([
    [100, "Title"],
    [200, "Title2"]
  ])

  // Query
  // Range key opreation is also stringly typed also
  await Card.primaryKey.query({
    hash: 100,
    range: [">=", "Title"]
  })

  // Delete record
  await card.delete()

```
