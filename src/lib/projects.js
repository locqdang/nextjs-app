// fetch all projects from strapi
const STRAPI_URL = process.env.STRAPI_URL;
const STRAPI_API_KEY = process.env.STRAPI_API_TOKEN;

export async function fetchProjects() {
  const url = new URL(`${STRAPI_URL}/api/projects`);
  url.searchParams.set('populate', '*');

  try {
    const res = await fetch(url.toString(), {
      medthod: 'GET',
      headers: {
        ...(STRAPI_API_KEY ? { Authorization: `Bearer ${STRAPI_API_KEY}` } : {}),
      },
    });

    if (!res.ok) {
      throw new Error(`Strapi error: ${res.status} ${res.statusText}`);
    }

    const json = await res.json();
    return json; // normalize at the call site: json?.data?.attributes ?? json?.data
  } catch (e) {
    console.error('Error fetching projects:', e);
    return null;
  }
}
