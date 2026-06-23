// Tests for API logging helpers that add request context while avoiding plain user emails in logs.

import { afterEach, describe, expect, it, vi } from 'vitest';

const ORIGINAL_ENV = { ...process.env };

async function loadApiLoggingModule() {
  // Intent: reload after env changes so userHash behavior uses the current test salt.
  vi.resetModules();
  return import('../../lib/api-logging');
}

describe('api logging helpers', () => {
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it('uses incoming x-request-id when present', async () => {
    const { getRequestId } = await loadApiLoggingModule();

    const req = {
      headers: {
        'x-request-id': 'request-from-proxy',
      },
    };

    expect(getRequestId(req)).toBe('request-from-proxy');
  });

  it('uses the first x-request-id when header is an array', async () => {
    const { getRequestId } = await loadApiLoggingModule();

    const req = {
      headers: {
        'x-request-id': ['first-request-id', 'second-request-id'],
      },
    };

    expect(getRequestId(req)).toBe('first-request-id');
  });

  it('generates a request ID when header is missing', async () => {
    const { getRequestId } = await loadApiLoggingModule();

    const req = {
      headers: {},
    };

    const requestId = getRequestId(req);

    expect(requestId).toEqual(expect.any(String));
    expect(requestId).toHaveLength(36);
  });

  it('creates an API child logger with safe request context', async () => {
    process.env.LOG_HASH_SALT = 'test-salt';

    const { createApiLogger } = await loadApiLoggingModule();

    const req = {
      method: 'PUT',
      headers: {
        'x-request-id': 'profile-request-123',
      },
    };

    const log = createApiLogger(req, {
      route: '/api/haro/profile',
      operation: 'haro_profile_update',
      userEmail: ' Loc@Example.com ',
    });

    const bindings = log.bindings();

    expect(bindings).toMatchObject({
      app: 'vietpolyglots',
      route: '/api/haro/profile',
      operation: 'haro_profile_update',
      method: 'PUT',
      requestId: 'profile-request-123',
    });

    expect(bindings.userHash).toEqual(expect.any(String));
    expect(bindings.userHash).toHaveLength(24);
    expect(JSON.stringify(bindings)).not.toContain('Loc@Example.com');
    expect(JSON.stringify(bindings)).not.toContain('loc@example.com');
  });

  it('omits userHash when user email is unavailable', async () => {
    process.env.LOG_HASH_SALT = 'test-salt';

    const { createApiLogger } = await loadApiLoggingModule();

    const req = {
      method: 'GET',
      headers: {
        'x-request-id': 'anonymous-request-123',
      },
    };

    const log = createApiLogger(req, {
      route: '/api/data',
      operation: 'load_data',
    });

    const bindings = log.bindings();

    expect(bindings).toMatchObject({
      route: '/api/data',
      operation: 'load_data',
      method: 'GET',
      requestId: 'anonymous-request-123',
    });
    expect(bindings.userHash).toBeUndefined();
  });
});
