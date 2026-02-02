/**
 * Unified data access module for Next.js app
 * Provides interfaces to both MongoDB and Strapi CMS
 */

// MongoDB exports
export {
  connectToMongoDB,
  closeMongoDBConnection,
  getCollection,
  findOne,
  findMany,
  insertOne,
  updateOne,
  deleteOne,
} from './mongodb';

// Strapi exports
export {
  formatMediaURL,
  fetchFromStrapi,
  fetchStrapiEntry,
  fetchStrapiEntries,
  createStrapiEntry,
  updateStrapiEntry,
  deleteStrapiEntry,
} from './strapi';

/**
 * Example usage:
 * 
 * // Fetch from Strapi
 * import { fetchStrapiEntries } from '@/lib/data';
 * const posts = await fetchStrapiEntries('posts', { populate: '*' });
 * 
 * // Query MongoDB
 * import { findMany } from '@/lib/data';
 * const users = await findMany('users', { active: true });
 */
