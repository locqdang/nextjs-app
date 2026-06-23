import { MongoClient } from 'mongodb';
import { logger, serializeError } from '../logger.js';

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.MONGO_DB;

let client = null;
let db = null;

/**
 * Connect to MongoDB
 */
export async function connectToMongoDB() {
  if (db) {
    logger.debug({ db: DB_NAME }, 'MongoDB already connected');
    return db;
  }

  try {
    client = new MongoClient(MONGO_URI, {
      maxPoolSize: 10,
      minPoolSize: 2,
    });

    await client.connect();
    db = client.db(DB_NAME);
    logger.info({ db: DB_NAME }, 'Connected to MongoDB');
    return db;
  } catch (error) {
    logger.error({ error: serializeError(error), db: DB_NAME }, 'MongoDB connection failed');
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
    logger.info({ db: DB_NAME }, 'MongoDB connection closed');
  }
}

/**
 * Get a specific collection from MongoDB
 */
export async function getCollection(collectionName) {
  const database = await connectToMongoDB();
  return database.collection(collectionName);
}

/**
 * Find one document in a collection
 */
export async function findOne(collectionName, query) {
  try {
    const collection = await getCollection(collectionName);
    return await collection.findOne(query);
  } catch (error) {
    logger.error({ error: serializeError(error), collectionName }, 'MongoDB findOne failed');
    throw error;
  }
}

/**
 * Find multiple documents in a collection
 */
export async function findMany(collectionName, query = {}, options = {}) {
  try {
    const collection = await getCollection(collectionName);
    return await collection.find(query).setOptions(options).toArray();
  } catch (error) {
    logger.error({ error: serializeError(error), collectionName }, 'MongoDB findMany failed');
    throw error;
  }
}

/**
 * Insert a document into a collection
 */
export async function insertOne(collectionName, document) {
  try {
    const collection = await getCollection(collectionName);
    return await collection.insertOne(document);
  } catch (error) {
    logger.error({ error: serializeError(error), collectionName }, 'MongoDB insertOne failed');
    throw error;
  }
}

/**
 * Update a document in a collection
 */
export async function updateOne(collectionName, query, updates) {
  try {
    const collection = await getCollection(collectionName);
    return await collection.updateOne(query, { $set: updates });
  } catch (error) {
    logger.error({ error: serializeError(error), collectionName }, 'MongoDB updateOne failed');
    throw error;
  }
}

/**
 * Delete a document from a collection
 */
export async function deleteOne(collectionName, query) {
  try {
    const collection = await getCollection(collectionName);
    return await collection.deleteOne(query);
  } catch (error) {
    logger.error({ error: serializeError(error), collectionName }, 'MongoDB deleteOne failed');
    throw error;
  }
}
