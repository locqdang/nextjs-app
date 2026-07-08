import { describe, expect, it } from 'vitest';

import nextConfig from '../../next.config.mjs';

function headersToMap(headers) {
  return new Map(headers.map((header) => [header.key, header.value]));
}

describe('next security headers', () => {
  it('applies the required security headers site-wide', async () => {
    const rules = await nextConfig.headers();
    const appRule = rules.find((rule) => rule.source === '/:path*');

    expect(appRule).toBeDefined();

    const headers = headersToMap(appRule.headers);
    expect(headers.get('Content-Security-Policy')).toContain("default-src 'self'");
    expect(headers.get('Content-Security-Policy')).toContain('https://www.googletagmanager.com');
    expect(headers.get('Content-Security-Policy')).toContain('https://accounts.google.com');
    expect(headers.get('Content-Security-Policy')).toContain('https://apis.google.com');
    expect(headers.get('Content-Security-Policy')).toContain("frame-ancestors 'none'");
    expect(headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(headers.get('X-Frame-Options')).toBe('DENY');
    expect(headers.get('Permissions-Policy')).toBe('camera=(), microphone=(), geolocation=()');
  });

  it('marks API responses as non-cacheable while preserving the global security headers', async () => {
    const rules = await nextConfig.headers();
    const appRule = rules.find((rule) => rule.source === '/:path*');
    const apiRule = rules.find((rule) => rule.source === '/api/:path*');

    expect(apiRule).toBeDefined();

    const appHeaders = headersToMap(appRule.headers);
    const apiHeaders = headersToMap(apiRule.headers);

    expect(apiHeaders.get('Content-Security-Policy')).toBe(
      appHeaders.get('Content-Security-Policy')
    );
    expect(apiHeaders.get('Referrer-Policy')).toBe(appHeaders.get('Referrer-Policy'));
    expect(apiHeaders.get('X-Content-Type-Options')).toBe('nosniff');
    expect(apiHeaders.get('X-Frame-Options')).toBe('DENY');
    expect(apiHeaders.get('Permissions-Policy')).toBe('camera=(), microphone=(), geolocation=()');
    expect(apiHeaders.get('Cache-Control')).toBe('no-store, no-cache, must-revalidate');
    expect(apiHeaders.get('Pragma')).toBe('no-cache');
  });
});
