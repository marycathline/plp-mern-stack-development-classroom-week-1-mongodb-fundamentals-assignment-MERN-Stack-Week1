// queries.js
const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const dbName = 'plp_bookstore';
const collectionName = 'books';

async function runQueries() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const books = db.collection(collectionName);

    console.log('\n--- Task 2: Basic Queries ---');

    // 1. Find all books in a specific genre
    console.log(await books.find({ genre: 'Fiction' }).toArray());

    // 2. Find books published after a certain year
    console.log(await books.find({ published_year: { $gt: 1950 } }).toArray());

    // 3. Find books by a specific author
    console.log(await books.find({ author: 'George Orwell' }).toArray());

    // 4. Update the price of a specific book
    await books.updateOne({ title: '1984' }, { $set: { price: 13.99 } });

    // 5. Delete a book by its title
    await books.deleteOne({ title: 'Moby Dick' });

    console.log('\n--- Task 3: Advanced Queries ---');

    // 1. Find books that are both in stock and published after 2010
    console.log(await books.find({ in_stock: true, published_year: { $gt: 2010 } }).toArray());

    // 2. Use projection to return only the title, author, and price fields
    console.log(await books.find({}, { projection: { _id: 0, title: 1, author: 1, price: 1 } }).toArray());

    // 3. Sorting by price (ascending)
    console.log(await books.find().sort({ price: 1 }).toArray());

    // 4. Sorting by price (descending)
    console.log(await books.find().sort({ price: -1 }).toArray());

    // 5. Pagination (5 books per page, page 2)
    console.log(await books.find().skip(5).limit(5).toArray());

    console.log('\n--- Task 4: Aggregation Pipelines ---');

    // 1. Average price of books by genre
    console.log(await books.aggregate([
      { $group: { _id: '$genre', avgPrice: { $avg: '$price' } } }
    ]).toArray());

    // 2. Author with the most books
    console.log(await books.aggregate([
      { $group: { _id: '$author', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]).toArray());

    // 3. Group books by publication decade and count them
    console.log(await books.aggregate([
      { $project: { decade: { $concat: [{ $substr: [{ $toString: "$published_year" }, 0, 3] }, "0s"] } } },
      { $group: { _id: "$decade", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]).toArray());

    console.log('\n--- Task 5: Indexing ---');

    // 1. Create index on title
    await books.createIndex({ title: 1 });

    // 2. Create compound index on author and published_year
    await books.createIndex({ author: 1, published_year: 1 });

    // 3. Use explain() to show performance
    const explanation = await books.find({ title: '1984' }).explain();
    console.log('Explain output for index usage:\n', explanation);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('\nConnection closed.');
  }
}

runQueries();
