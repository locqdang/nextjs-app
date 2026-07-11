import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const SESSION_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'vp_session';
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;
const DEFAULT_SESSION_SAME_SITE = 'Lax';
const ALLOWED_SAME_SITE_VALUES = new Set(['Strict', 'Lax', 'None']);

function isProduction() {
  return process.env.NODE_ENV === 'production';
}

function getSessionSameSite() {
  const configuredValue = process.env.AUTH_COOKIE_SAME_SITE;

  if (!configuredValue) {
    return DEFAULT_SESSION_SAME_SITE;
  }

  const normalizedValue = configuredValue.trim();
  if (ALLOWED_SAME_SITE_VALUES.has(normalizedValue)) {
    return normalizedValue;
  }

  return DEFAULT_SESSION_SAME_SITE;
}

function shouldUseSecureCookies(sameSite) {
  if (sameSite === 'None') {
    return true;
  }

  return isProduction();
}

function buildSessionCookie(value, maxAgeSeconds, expiresAt) {
  const sameSite = getSessionSameSite();
  const parts = [
    `${SESSION_COOKIE_NAME}=${encodeCookieValue(value)}`,
    'Path=/',
    'HttpOnly',
    `SameSite=${sameSite}`,
    `Max-Age=${maxAgeSeconds}`,
    `Expires=${expiresAt}`,
  ];

  if (shouldUseSecureCookies(sameSite)) {
    parts.push('Secure');
  }

  return parts.join('; ');
}

function encodeCookieValue(value) {
  return encodeURIComponent(value);
}

function decodeCookieValue(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function parseCookies(headerValue = '') {
  return headerValue.split(';').reduce((cookies, part) => {
    const [name, ...rest] = part.trim().split('=');
    if (!name) return cookies;
    cookies[name] = decodeCookieValue(rest.join('='));
    return cookies;
  }, {});
}

export function createSessionToken(user) {
  return jwt.sign(
    {
      id: user._id?.toString?.() || user.id,
      email: user.email,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: `${SESSION_MAX_AGE_SECONDS}s` }
  );
}

export function verifySessionToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export function createSessionCookie(token) {
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000).toUTCString();
  return buildSessionCookie(token, SESSION_MAX_AGE_SECONDS, expiresAt);
}

export function createClearedSessionCookie() {
  return buildSessionCookie('', 0, 'Thu, 01 Jan 1970 00:00:00 GMT');
}

export function readSessionToken(req) {
  const cookies = parseCookies(req.headers?.cookie || '');
  return cookies[SESSION_COOKIE_NAME] || null;
}

export function readSession(req) {
  const token = readSessionToken(req);
  if (!token) return null;

  try {
    const decoded = verifySessionToken(token);
    return {
      token,
      user: {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
      },
    };
  } catch {
    return null;
  }
}

export function setSessionCookie(res, token) {
  res.setHeader('Set-Cookie', createSessionCookie(token));
}

export function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', createClearedSessionCookie());
}

export { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS };
