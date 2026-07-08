const FRONTEND_ORIGIN = process.env.NEXT_PUBLIC_FRONTEND_URL?.replace(/\/$/, '') || null;

const CONTROL_CHARS = /[\u0000-\u001F\u007F]/g;

function stripControlChars(value) {
  return String(value || '')
    .replace(CONTROL_CHARS, '')
    .trim();
}

export function sanitizeStructuredDataJson(value) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

export function normalizeLinkUrl(url) {
  const trimmedUrl = stripControlChars(url);
  if (!trimmedUrl || trimmedUrl.includes('\\')) return null;

  if (/^[\\/]{2,}/.test(trimmedUrl) || trimmedUrl.startsWith('\\\\')) {
    return null;
  }

  if (trimmedUrl.startsWith('/')) {
    return trimmedUrl;
  }

  if (trimmedUrl.startsWith('#')) {
    return trimmedUrl;
  }

  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmedUrl)) {
    try {
      const parsed = new URL(trimmedUrl);
      const protocol = parsed.protocol.toLowerCase();
      if (protocol !== 'http:' && protocol !== 'https:') {
        return null;
      }

      if (FRONTEND_ORIGIN) {
        const frontendOrigin = new URL(FRONTEND_ORIGIN).origin;
        if (parsed.origin === frontendOrigin) {
          return `${parsed.pathname}${parsed.search}${parsed.hash}` || '/';
        }
      }

      return parsed.pathname === '/' && !parsed.search && !parsed.hash
        ? parsed.origin
        : parsed.toString();
    } catch {
      return null;
    }
  }

  if (/^[a-z0-9-]+(\.[a-z0-9-]+)+([/?#:].*)?$/i.test(trimmedUrl)) {
    try {
      const parsed = new URL(`https://${trimmedUrl}`);
      return parsed.pathname === '/' && !parsed.search && !parsed.hash
        ? parsed.origin
        : parsed.toString();
    } catch {
      return null;
    }
  }

  if (/^[^\s:?#]+(\/[^\s:?#][^\s]*)?$/i.test(trimmedUrl)) {
    return `/${trimmedUrl.replace(/^\/+/, '')}`;
  }

  return null;
}

export function isExternalUrl(url) {
  return /^https?:\/\//i.test(url);
}

export function normalizeRedirectPath(value, fallback = '/') {
  const trimmedValue = stripControlChars(value);
  if (!trimmedValue) return fallback;

  if (/^[\\/]{2,}/.test(trimmedValue) || trimmedValue.startsWith('\\\\')) {
    return fallback;
  }

  if (!trimmedValue.startsWith('/')) {
    return fallback;
  }

  if (trimmedValue.includes('\\')) {
    return fallback;
  }

  return trimmedValue;
}
