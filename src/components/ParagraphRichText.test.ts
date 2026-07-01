import { describe, expect, it } from 'vitest';

import { normalizeLinkUrl } from './ParagraphRichText';

describe('normalizeLinkUrl', () => {
  it('keeps internal paths root-relative', () => {
    expect(normalizeLinkUrl('/about')).toBe('/about');
    expect(normalizeLinkUrl('contact')).toBe('/contact');
    expect(normalizeLinkUrl('nested/page')).toBe('/nested/page');
  });

  it('keeps hash links as-is', () => {
    expect(normalizeLinkUrl('#section-1')).toBe('#section-1');
  });

  it('keeps explicit external links as http/https URLs', () => {
    expect(normalizeLinkUrl('https://example.com')).toBe('https://example.com');
    expect(normalizeLinkUrl('http://example.com/path')).toBe('http://example.com/path');
  });

  it('promotes bare domains to external https URLs', () => {
    expect(normalizeLinkUrl('example.com')).toBe('https://example.com');
    expect(normalizeLinkUrl('www.example.com/path?q=1')).toBe('https://www.example.com/path?q=1');
  });
});
