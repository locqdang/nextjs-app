import { afterEach, describe, expect, it, vi } from 'vitest';

const ORIGINAL_ENV = { ...process.env };

async function loadLoggerModule() {
  vi.resetModules();
  return import('../../lib/logger');
}

describe('logger helpers', () => {
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it('serializes useful error fields', async () => {
    process.env.LOG_INCLUDE_STACK = '1';

    const { serializeError } = await loadLoggerModule();

    const error = new Error('Database failed');
    error.code = 'DB_DOWN';
    error.statusCode = 503;

    const serialized = serializeError(error);

    expect(serialized).toMatchObject({
      name: 'Error',
      message: 'Database failed',
      code: 'DB_DOWN',
      status: 503,
    });
    expect(serialized.stack).toContain('Database failed');
  });

  it('can omit stack traces when LOG_INCLUDE_STACK is disabled', async () => {
    process.env.LOG_INCLUDE_STACK = '0';

    const { serializeError } = await loadLoggerModule();

    const error = new Error('Hidden stack');
    const serialized = serializeError(error);

    expect(serialized.message).toBe('Hidden stack');
    expect(serialized.stack).toBeUndefined();
  });

  it('redacts sensitive token-like fields recursively', async () => {
    const { redactLogFields } = await loadLoggerModule();

    const redacted = redactLogFields({
      email: 'person@example.com',
      token: 'secret-token',
      authorization: 'Bearer secret-token',
      nested: {
        refreshToken: 'refresh-secret',
        normalField: 'safe',
      },
      list: [{ access_token: 'access-secret' }],
    });

    expect(redacted).toEqual({
      email: 'person@example.com',
      token: '[Redacted]',
      authorization: '[Redacted]',
      nested: {
        refreshToken: '[Redacted]',
        normalField: 'safe',
      },
      list: [{ access_token: '[Redacted]' }],
    });
  });

  it('hashes user identity consistently without returning plain email', async () => {
    process.env.LOG_HASH_SALT = 'test-salt';

    const { hashUserIdentity } = await loadLoggerModule();

    const first = hashUserIdentity(' Loc@Example.com ');
    const second = hashUserIdentity('loc@example.com');

    expect(first).toBe(second);
    expect(first).toHaveLength(24);
    expect(first).not.toContain('loc@example.com');
  });

  it('does not hash user identity without LOG_HASH_SALT', async () => {
    delete process.env.LOG_HASH_SALT;

    const { hashUserIdentity } = await loadLoggerModule();

    expect(hashUserIdentity('loc@example.com')).toBeUndefined();
  });

  it('never allows login-link logging in production', async () => {
    process.env.NODE_ENV = 'production';
    process.env.LOG_LOGIN_LINKS = '1';

    const { canLogLoginLinks } = await loadLoggerModule();

    expect(canLogLoginLinks()).toBe(false);
  });

  it('allows login-link logging only with explicit local opt-in', async () => {
    process.env.NODE_ENV = 'development';
    process.env.LOG_LOGIN_LINKS = '1';

    const { canLogLoginLinks } = await loadLoggerModule();

    expect(canLogLoginLinks()).toBe(true);
  });

  it('does not allow login-link logging in development without explicit opt-in', async () => {
    process.env.NODE_ENV = 'development';
    delete process.env.LOG_LOGIN_LINKS;

    const { canLogLoginLinks } = await loadLoggerModule();

    expect(canLogLoginLinks()).toBe(false);
  });
});
