import { logger, serializeError } from '../logger.js';

const STRAPI_URL = process.env.STRAPI_URL || 'https://strapi.vietpolyglots.com';
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

/**
 * Format media URL from Strapi
 */
export function formatMediaURL(url) {
  if (!url) return null;
  return url.startsWith('/') ? STRAPI_URL + url : url;
}

/**
 * Fetch data from Strapi API
 */
export async function fetchFromStrapi(endpoint, options = {}) {
  try {
    const url = new URL(`${STRAPI_URL}/api/${endpoint}`);

    if (options.populate) {
      if (Array.isArray(options.populate)) {
        options.populate.forEach((field, index) => {
          url.searchParams.set(`populate[${index}]`, field);
        });
      } else {
        url.searchParams.set('populate', options.populate);
      }
    }

    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        url.searchParams.set(`filters[${key}]`, value);
      });
    }

    if (options.pagination) {
      url.searchParams.set('pagination[page]', options.pagination.page || 1);
      url.searchParams.set('pagination[pageSize]', options.pagination.pageSize || 25);
    }

    if (options.sort) {
      url.searchParams.set('sort', options.sort);
    }

    if (options.queryParams) {
      Object.entries(options.queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      });
    }

    const headers = {
      'Content-Type': 'application/json',
    };

    if (STRAPI_TOKEN) {
      headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Strapi API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    logger.error({ error: serializeError(error), endpoint }, 'Error fetching from Strapi');
    throw error;
  }
}

/**
 * Fetch a single entry from Strapi
 */
export async function fetchStrapiEntry(contentType, id, options = {}) {
  const response = await fetchFromStrapi(`${contentType}/${id}`, options);
  return response.data;
}

/**
 * Fetch multiple entries from Strapi
 */
export async function fetchStrapiEntries(contentType, options = {}) {
  const response = await fetchFromStrapi(contentType, options);
  return response.data || [];
}

/**
 * Create an entry in Strapi
 */
export async function createStrapiEntry(contentType, data) {
  try {
    const url = `${STRAPI_URL}/api/${contentType}`;
    const headers = {
      'Content-Type': 'application/json',
    };

    if (STRAPI_TOKEN) {
      headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ data }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create Strapi entry: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    logger.error({ error: serializeError(error), contentType }, 'Error creating Strapi entry');
    throw error;
  }
}

/**
 * Update an entry in Strapi
 */
export async function updateStrapiEntry(contentType, id, data) {
  try {
    const url = `${STRAPI_URL}/api/${contentType}/${id}`;
    const headers = {
      'Content-Type': 'application/json',
    };

    if (STRAPI_TOKEN) {
      headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ data }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update Strapi entry: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    logger.error({ error: serializeError(error), contentType, id }, 'Error updating Strapi entry');
    throw error;
  }
}

/**
 * Delete an entry from Strapi
 */
export async function deleteStrapiEntry(contentType, id) {
  try {
    const url = `${STRAPI_URL}/api/${contentType}/${id}`;
    const headers = {
      'Content-Type': 'application/json',
    };

    if (STRAPI_TOKEN) {
      headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
    }

    const response = await fetch(url, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to delete Strapi entry: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    logger.error({ error: serializeError(error), contentType, id }, 'Error deleting Strapi entry');
    throw error;
  }
}
