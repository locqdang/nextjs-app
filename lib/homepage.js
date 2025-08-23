const STRAPI_URL = process.env.STRAPI_URL || "http://10.0.0.61:9930";
const STRAPI_API_KEY = process.env.STRAPI_API_TOKEN;

export async function fetchHomepage() {
  // Set the url
  const url = new URL(`${STRAPI_URL}/api/homepage`);
  url.searchParams.set("populate[hero][populate]", "*");
  url.searchParams.set("populate[featuredProjects][populate]", "*");
  url.searchParams.set("populate[featuredBlogPosts][populate]", "*");
  url.searchParams.set("populate[seo][populate]", "*");

  // Ensure featuredProjects comes with everything (logo, tags, categories)

  // Fetching homepage
  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        ...(STRAPI_API_KEY
          ? { Authorization: `Bearer ${STRAPI_API_KEY}` }
          : {}),
      },
    });

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (e) {
    console.error(`Error fetching home page: ${e}`);
    return null;
  }
}
