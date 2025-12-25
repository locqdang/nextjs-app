export function formatMediaURL(url) {
    const BASE = process.env.STRAPI_URL || "https://strapi.vietpolyglots.com";
    if (!url) return null;
    return url.startsWith("/") ? BASE + url : url;
 }