import { describe, expect, it } from 'vitest';

import nextConfig from '../../next.config.mjs';

function headersToMap(headers) {
  return new Map(headers.map((header) => [header.key, header.value]));
}

describe('static Next security headers', () => {
  it('leaves request-scoped CSP ownership to middleware', async () => {
    const rules = await nextConfig.headers();
    const appRule = rules.find((rule) => rule.source === '/:path*');

    expect(appRule).toBeDefined();

    const headers = headersToMap(appRule.headers);
    expect(headers.has('Content-Security-Policy')).toBe(false);
    expect(headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(headers.get('X-Frame-Options')).toBe('DENY');
    expect(headers.get('Permissions-Policy')).toBe('camera=(), microphone=(), geolocation=()');
  });

  it('marks API responses as non-cacheable while preserving static security headers', async () => {
    const rules = await nextConfig.headers();
    const appRule = rules.find((rule) => rule.source === '/:path*');
    const apiRule = rules.find((rule) => rule.source === '/api/:path*');

    expect(apiRule).toBeDefined();

    const appHeaders = headersToMap(appRule.headers);
    const apiHeaders = headersToMap(apiRule.headers);

    expect(apiHeaders.has('Content-Security-Policy')).toBe(false);
    expect(apiHeaders.get('Referrer-Policy')).toBe(appHeaders.get('Referrer-Policy'));
    expect(apiHeaders.get('X-Content-Type-Options')).toBe('nosniff');
    expect(apiHeaders.get('X-Frame-Options')).toBe('DENY');
    expect(apiHeaders.get('Permissions-Policy')).toBe('camera=(), microphone=(), geolocation=()');
    expect(apiHeaders.get('Cache-Control')).toBe('no-store, no-cache, must-revalidate');
    expect(apiHeaders.get('Pragma')).toBe('no-cache');
  });
});
