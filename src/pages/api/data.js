/**
 * Example API route showing both MongoDB and Strapi usage
 * GET /api/data
 */

import { findMany as mongoFindMany, fetchStrapiEntries } from '../../lib/data/index.js';
import { createApiLogger } from '../../lib/api-logging';
import { serializeError } from '../../lib/logger';

export default async function handler(req, res) {
  const log = createApiLogger(req, {
    route: '/api/data',
    operation: 'data_api',
  });

  if (req.method !== 'GET') {
    log.warn({ method: req.method }, 'Invalid data API method');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let strapiPosts = [];
    try {
      strapiPosts = await fetchStrapiEntries('posts', {
        populate: '*',
        pagination: { pageSize: 5 },
      });
    } catch (error) {
      log.warn({ error: serializeError(error) }, 'Strapi fetch failed');
    }

    let mongoItems = [];
    try {
      mongoItems = await mongoFindMany('items', {}, { limit: 10 });
    } catch (error) {
      log.warn({ error: serializeError(error) }, 'MongoDB fetch failed');
    }

    res.status(200).json({
      success: true,
      data: {
        strapiPosts,
        mongoItems,
      },
    });
  } catch (error) {
    log.error({ error: serializeError(error) }, 'API data route error');
    res.status(500).json({ error: 'Internal server error' });
  }
}
