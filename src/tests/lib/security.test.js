import { afterEach, describe, expect, it, vi } from 'vitest';

const ORIGINAL_ENV = { ...process.env };

async function loadSecurityModule() {
  vi.resetModules();
  return import('../../lib/security');
}

describe('security helpers', () => {
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    vi.resetModules();
  });

  it('rejects dangerous link protocols and protocol-relative URLs', async () => {
    const { normalizeLinkUrl } = await loadSecurityModule();

    expect(normalizeLinkUrl('javascript:alert(1)')).toBeNull();
    expect(normalizeLinkUrl('data:text/html,<svg/onload=alert(1)>')).toBeNull();
    expect(normalizeLinkUrl('//evil.example/path')).toBeNull();
    expect(normalizeLinkUrl('\\evil.example\share')).toBeNull();
  });

  it('normalizes same-origin absolute links to root-relative paths', async () => {
    process.env.NEXT_PUBLIC_FRONTEND_URL = 'https://vietpolyglots.com';
    const { normalizeLinkUrl } = await loadSecurityModule();

    expect(normalizeLinkUrl('https://vietpolyglots.com/haro/profile?tab=mailbox#connected')).toBe(
      '/haro/profile?tab=mailbox#connected'
    );
  });

  it('fails closed for unsafe redirect targets', async () => {
    const { normalizeRedirectPath } = await loadSecurityModule();

    expect(normalizeRedirectPath('https://evil.example')).toBe('/');
    expect(normalizeRedirectPath('//evil.example')).toBe('/');
    expect(normalizeRedirectPath('/\\evil')).toBe('/');
    expect(normalizeRedirectPath('javascript:alert(1)')).toBe('/');
    expect(normalizeRedirectPath('/safe/path?tab=1#hash')).toBe('/safe/path?tab=1#hash');
  });

  it('escapes structured data payloads for script context', async () => {
    const { sanitizeStructuredDataJson } = await loadSecurityModule();

    const escaped = sanitizeStructuredDataJson({
      dangerous: '</script><script>alert(1)</script>',
      lineSep: 'a\u2028b\u2029c',
    });

    expect(escaped).not.toContain('</script>');
    expect(escaped).toContain('\\u003c/script\\u003e\\u003cscript\\u003ealert(1)\\u003c/script\\u003e');
    expect(escaped).toContain('\\u2028');
    expect(escaped).toContain('\\u2029');
  });
});
