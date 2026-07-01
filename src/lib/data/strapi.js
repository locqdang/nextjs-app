import { logger, serializeError } from '../logger.js';

const STRAPI_PUBLIC_URL = process.env.STRAPI_URL || 'https://strapi.vietpolyglots.com';
const STRAPI_INTERNAL_URL = process.env.STRAPI_INTERNAL_URL || 'http://192.168.0.61:9930';
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;
const STRAPI_API_BASES = Array.from(
  new Set([STRAPI_PUBLIC_URL, STRAPI_INTERNAL_URL].filter(Boolean))
);

function buildHeaders() {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (STRAPI_TOKEN) {
    headers.Authorization = `Bearer ${STRAPI_TOKEN}`;
  }

  return headers;
}

function buildStrapiUrl(baseUrl, endpoint, options = {}) {
  const url = new URL(`${baseUrl}/api/${endpoint}`);

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

  return url;
}

/**
 * Format media URL from Strapi
 */
export function formatMediaURL(url) {
  if (!url) return null;
  return url.startsWith('/') ? STRAPI_PUBLIC_URL + url : url;
}

/**
 * Fetch data from Strapi API
 */
export async function fetchFromStrapi(endpoint, options = {}) {
  let lastError = null;

  for (const baseUrl of STRAPI_API_BASES) {
    try {
      const url = buildStrapiUrl(baseUrl, endpoint, options);
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: buildHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Strapi API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      lastError = error;
      logger.warn(
        { error: serializeError(error), endpoint, baseUrl },
        'Strapi fetch failed for base URL, trying next candidate if available'
      );
    }
  }

  logger.error({ error: serializeError(lastError), endpoint }, 'Error fetching from Strapi');
  throw lastError;
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
    const url = `${STRAPI_INTERNAL_URL}/api/${contentType}`;
    const headers = buildHeaders();

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
    const url = `${STRAPI_INTERNAL_URL}/api/${contentType}/${id}`;
    const headers = buildHeaders();

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
    const url = `${STRAPI_INTERNAL_URL}/api/${contentType}/${id}`;
    const headers = buildHeaders();

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
