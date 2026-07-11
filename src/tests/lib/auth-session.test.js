import { afterEach, describe, expect, it, vi } from 'vitest';

const ORIGINAL_ENV = { ...process.env };

async function loadSessionModule() {
  vi.resetModules();
  return import('../../lib/auth/session');
}

function createRequest(cookie = '', authorization = '') {
  return {
    headers: {
      cookie,
      authorization,
    },
  };
}

describe('auth session helpers', () => {
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    vi.resetModules();
  });

  it('creates HttpOnly session cookies with SameSite and max-age', async () => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.AUTH_COOKIE_NAME = 'vp_session';
    process.env.NODE_ENV = 'development';

    const { createSessionCookie } = await loadSessionModule();
    const cookie = createSessionCookie('signed-token');

    expect(cookie).toContain('vp_session=signed-token');
    expect(cookie).toContain('Path=/');
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('SameSite=Lax');
    expect(cookie).toContain('Max-Age=604800');
    expect(cookie).toMatch(/Expires=.+GMT/);
    expect(cookie).not.toContain('Secure');
  });

  it('honors an approved SameSite override and keeps cookie clearing compatible', async () => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.AUTH_COOKIE_SAME_SITE = 'Strict';

    const { createSessionCookie, createClearedSessionCookie } = await loadSessionModule();
    const activeCookie = createSessionCookie('signed-token');
    const clearedCookie = createClearedSessionCookie();

    expect(activeCookie).toContain('SameSite=Strict');
    expect(clearedCookie).toContain('SameSite=Strict');
    expect(clearedCookie).toContain('Max-Age=0');
  });

  it('forces Secure when SameSite=None is configured for cross-site flows', async () => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.NODE_ENV = 'development';
    process.env.AUTH_COOKIE_SAME_SITE = 'None';

    const { createSessionCookie } = await loadSessionModule();
    const cookie = createSessionCookie('signed-token');

    expect(cookie).toContain('SameSite=None');
    expect(cookie).toContain('Secure');
  });

  it('falls back to Lax when SameSite override is invalid', async () => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.AUTH_COOKIE_SAME_SITE = 'sideways';

    const { createSessionCookie } = await loadSessionModule();
    const cookie = createSessionCookie('signed-token');

    expect(cookie).toContain('SameSite=Lax');
  });

  it('adds Secure to production cookies and expiry when clearing', async () => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.NODE_ENV = 'production';

    const { createClearedSessionCookie } = await loadSessionModule();
    const cookie = createClearedSessionCookie();

    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('SameSite=Lax');
    expect(cookie).toContain('Max-Age=0');
    expect(cookie).toContain('Expires=Thu, 01 Jan 1970 00:00:00 GMT');
    expect(cookie).toContain('Secure');
  });

  it('reads authenticated session from cookie', async () => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.AUTH_COOKIE_NAME = 'vp_session';

    const { createSessionToken, readSession } = await loadSessionModule();
    const token = createSessionToken({
      id: 'user-123',
      email: 'person@example.com',
      name: 'Person',
    });
    const session = readSession(createRequest(`vp_session=${encodeURIComponent(token)}`));

    expect(session).toMatchObject({
      user: {
        id: 'user-123',
        email: 'person@example.com',
        name: 'Person',
      },
    });
  });

  it('rejects bearer auth when no session cookie is present', async () => {
    process.env.JWT_SECRET = 'test-secret';

    const { createSessionToken, readSession } = await loadSessionModule();
    const token = createSessionToken({
      id: 'user-456',
      email: 'legacy@example.com',
      name: 'Legacy',
    });
    const session = readSession(createRequest('', `Bearer ${token}`));

    expect(session).toBeNull();
  });

  it('returns null for invalid session data', async () => {
    process.env.JWT_SECRET = 'test-secret';

    const { readSession } = await loadSessionModule();

    expect(readSession(createRequest('vp_session=not-a-valid-token'))).toBeNull();
  });
});
