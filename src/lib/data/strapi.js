const STRAPI_URL = process.env.STRAPI_URL || 'https://strapi.vietpolyglots.com';
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

/**
 * Format media URL from Strapi
 * @param {string} url - Media URL from Strapi
 * @returns {string|null} Full media URL or null
 */
export function formatMediaURL(url) {
  if (!url) return null;
  return url.startsWith('/') ? STRAPI_URL + url : url;
}

/**
 * Fetch data from Strapi API
 * @param {string} endpoint - API endpoint (e.g., 'pages', 'posts')
 * @param {object} options - Query options (populate, filters, pagination, sort)
 * @returns {Promise<object|array>} Strapi API response
 */
export async function fetchFromStrapi(endpoint, options = {}) {
  try {
    const url = new URL(`${STRAPI_URL}/api/${endpoint}`);

    // Add populate parameters
    if (options.populate) {
      if (Array.isArray(options.populate)) {
        options.populate.forEach((field, index) => {
          url.searchParams.set(`populate[${index}]`, field);
        });
      } else {
        url.searchParams.set('populate', options.populate);
      }
    }

    // Add filters
    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        url.searchParams.set(`filters[${key}]`, value);
      });
    }

    // Add pagination
    if (options.pagination) {
      url.searchParams.set('pagination[page]', options.pagination.page || 1);
      url.searchParams.set('pagination[pageSize]', options.pagination.pageSize || 25);
    }

    // Add sorting
    if (options.sort) {
      url.searchParams.set('sort', options.sort);
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
    console.error(`Error fetching from Strapi endpoint "${endpoint}":`, error.message);
    throw error;
  }
}

/**
 * Fetch a single entry from Strapi
 * @param {string} contentType - Content type (e.g., 'pages', 'posts')
 * @param {number|string} id - Entry ID
 * @param {object} options - Query options
 * @returns {Promise<object>} Single entry data
 */
export async function fetchStrapiEntry(contentType, id, options = {}) {
  const response = await fetchFromStrapi(`${contentType}/${id}`, options);
  return response.data;
}

/**
 * Fetch multiple entries from Strapi
 * @param {string} contentType - Content type (e.g., 'pages', 'posts')
 * @param {object} options - Query options
 * @returns {Promise<array>} Array of entries
 */
export async function fetchStrapiEntries(contentType, options = {}) {
  const response = await fetchFromStrapi(contentType, options);
  return response.data || [];
}

/**
 * Create an entry in Strapi (requires authentication)
 * @param {string} contentType - Content type
 * @param {object} data - Entry data
 * @returns {Promise<object>} Created entry
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
    console.error(`Error creating Strapi entry in "${contentType}":`, error.message);
    throw error;
  }
}

/**
 * Update an entry in Strapi (requires authentication)
 * @param {string} contentType - Content type
 * @param {number|string} id - Entry ID
 * @param {object} data - Updated data
 * @returns {Promise<object>} Updated entry
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
    console.error(`Error updating Strapi entry in "${contentType}":`, error.message);
    throw error;
  }
}

/**
 * Delete an entry from Strapi (requires authentication)
 * @param {string} contentType - Content type
 * @param {number|string} id - Entry ID
 * @returns {Promise<object>} Delete result
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
    console.error(`Error deleting Strapi entry in "${contentType}":`, error.message);
    throw error;
  }
}
