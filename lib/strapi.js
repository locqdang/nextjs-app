import axios from 'axios';

const STRAPI_URL = process.env.STRAPI_URL || 'http://10.0.0.61:9330';
const STRAPI_API_KEY = process.env.STRAPI_API_KEY;

const strapiASTRAPI_API_KEY = axios.create({
  baseURL: `${STRAPI_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${STRAPI_API_KEY}`
  },
});

export const getProjects = async () => {
  try {
    const response = await strapiApi.get('/projects', {
      params: {
        populate: '*',
        sort: 'createdAt:desc',
      },
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching projects from Strapi:', error);
    return [];
  }
};

export default strapiApi;