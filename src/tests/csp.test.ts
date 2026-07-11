import { describe, expect, it } from 'vitest';

import { buildContentSecurityPolicy, createNonce } from '../lib/security/csp';

describe('request-scoped content security policy', () => {
  it('creates a fresh CSP-safe nonce for every request', () => {
    const first = createNonce();
    const second = createNonce();

    expect(first).toMatch(/^[A-Za-z0-9_-]{32}$/);
    expect(second).toMatch(/^[A-Za-z0-9_-]{32}$/);
    expect(first).not.toBe(second);
  });

  it('uses the request nonce without production unsafe script allowances', () => {
    const policy = buildContentSecurityPolicy('test_nonce_0123456789abcdefghi', {
      isDevelopment: false,
      isE2E: false,
    });

    const scriptDirective = policy
      .split('; ')
      .find((directive) => directive.startsWith('script-src'));

    expect(scriptDirective).toContain("script-src 'self' 'nonce-test_nonce_0123456789abcdefghi'");
    expect(scriptDirective).not.toContain("'unsafe-inline'");
    expect(scriptDirective).not.toContain("'unsafe-eval'");
    expect(policy).toContain(
      "frame-src 'self' https://accounts.google.com https://cal.vietpolyglots.com"
    );
    expect(policy).toContain("style-src 'self' 'unsafe-inline' https://accounts.google.com");
    expect(policy).not.toContain('*.cal.vietpolyglots.com');
    expect(policy).not.toContain('script-src https:');
  });

  it('keeps unsafe-eval limited to development and E2E tooling', () => {
    const development = buildContentSecurityPolicy('dev_nonce_0123456789abcdefghij', {
      isDevelopment: true,
      isE2E: false,
    });
    const e2e = buildContentSecurityPolicy('e2e_nonce_0123456789abcdefghij', {
      isDevelopment: false,
      isE2E: true,
    });

    expect(development).toContain("'unsafe-eval'");
    expect(e2e).toContain("'unsafe-eval'");
  });
});
