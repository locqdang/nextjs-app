// lib/strapi.js (add this next to fetchHomepage)
const STRAPI_URL = process.env.STRAPI_URL;
const STRAPI_API_KEY = process.env.STRAPI_API_TOKEN;

export async function fetchNavbar({ locale, preview = false } = {}) {
  const url = new URL(`${STRAPI_URL}/api/navbar`);

  // populate menu items (and anything nested inside them)
  url.searchParams.set("populate[menuItems][populate]", "*");
  if (locale) url.searchParams.set("locale", locale);
  if (preview) url.searchParams.set("publicationState", "preview");

  try {
    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        ...(STRAPI_API_KEY
          ? { Authorization: `Bearer ${STRAPI_API_KEY}` }
          : {}),
      },
      // cache: "no-store", // uncomment while testing
    });

    if (!res.ok) {
      throw new Error(`Strapi error: ${res.status} ${res.statusText}`);
    }

    const json = await res.json();
    return json; // normalize at the call site: json?.data?.attributes ?? json?.data
  } catch (e) {
    console.error("Error fetching navbar:", e);
    return null;
  }
}
