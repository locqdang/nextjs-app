import { MongoClient } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://root:khantaykhangiay@nextjs-db:27017/admin?authSource=admin';
const DB_NAME = process.env.MONGO_DB;

let client = null;
let db = null;

/**
 * Connect to MongoDB
 * @returns {Promise<object>} MongoDB database instance
 */
export async function connectToMongoDB() {
  if (db) {
    console.log('✓ MongoDB already connected');
    return db;
  }

  try {
    client = new MongoClient(MONGO_URI, {
      maxPoolSize: 10,
      minPoolSize: 2,
    });

    await client.connect();
    db = client.db(DB_NAME);
    console.log(`✓ Connected to MongoDB: ${DB_NAME}`);
    return db;
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error.message);
    throw error;
  }
}

/**
 * Close MongoDB connection
 */
export async function closeMongoDBConnection() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('✓ MongoDB connection closed');
  }
}

/**
 * Get a specific collection from MongoDB
 * @param {string} collectionName - Name of the collection
 * @returns {Promise<object>} MongoDB collection instance
 */
export async function getCollection(collectionName) {
  const database = await connectToMongoDB();
  return database.collection(collectionName);
}

/**
 * Find one document in a collection
 * @param {string} collectionName - Name of the collection
 * @param {object} query - MongoDB query filter
 * @returns {Promise<object|null>} Document or null if not found
 */
export async function findOne(collectionName, query) {
  try {
    const collection = await getCollection(collectionName);
    return await collection.findOne(query);
  } catch (error) {
    console.error(`Error finding document in ${collectionName}:`, error.message);
    throw error;
  }
}

/**
 * Find multiple documents in a collection
 * @param {string} collectionName - Name of the collection
 * @param {object} query - MongoDB query filter
 * @param {object} options - Query options (limit, sort, etc.)
 * @returns {Promise<array>} Array of documents
 */
export async function findMany(collectionName, query = {}, options = {}) {
  try {
    const collection = await getCollection(collectionName);
    return await collection.find(query).setOptions(options).toArray();
  } catch (error) {
    console.error(`Error finding documents in ${collectionName}:`, error.message);
    throw error;
  }
}

/**
 * Insert a document into a collection
 * @param {string} collectionName - Name of the collection
 * @param {object} document - Document to insert
 * @returns {Promise<object>} Insert result with insertedId
 */
export async function insertOne(collectionName, document) {
  try {
    const collection = await getCollection(collectionName);
    return await collection.insertOne(document);
  } catch (error) {
    console.error(`Error inserting document into ${collectionName}:`, error.message);
    throw error;
  }
}

/**
 * Update a document in a collection
 * @param {string} collectionName - Name of the collection
 * @param {object} query - MongoDB query filter
 * @param {object} updates - Update operations
 * @returns {Promise<object>} Update result
 */
export async function updateOne(collectionName, query, updates) {
  try {
    const collection = await getCollection(collectionName);
    return await collection.updateOne(query, { $set: updates });
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, error.message);
    throw error;
  }
}

/**
 * Delete a document from a collection
 * @param {string} collectionName - Name of the collection
 * @param {object} query - MongoDB query filter
 * @returns {Promise<object>} Delete result
 */
export async function deleteOne(collectionName, query) {
  try {
    const collection = await getCollection(collectionName);
    return await collection.deleteOne(query);
  } catch (error) {
    console.error(`Error deleting document in ${collectionName}:`, error.message);
    throw error;
  }
}
