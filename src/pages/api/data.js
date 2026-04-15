/**
 * Example API route showing both MongoDB and Strapi usage
 * GET /api/data - Returns combined data from both sources
 */

import { findMany as mongoFindMany, fetchStrapiEntries } from '../../lib/data/index.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Fetch from Strapi
    let strapiPosts = [];
    try {
      strapiPosts = await fetchStrapiEntries('posts', {
        populate: '*',
        pagination: { pageSize: 5 },
      });
    } catch (error) {
      console.warn('Strapi fetch failed:', error.message);
    }

    // Fetch from MongoDB (example collection: 'items')
    let mongoItems = [];
    try {
      mongoItems = await mongoFindMany('items', {}, { limit: 10 });
    } catch (error) {
      console.warn('MongoDB fetch failed:', error.message);
    }

    res.status(200).json({
      success: true,
      data: {
        strapiPosts,
        mongoItems,
      },
    });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
