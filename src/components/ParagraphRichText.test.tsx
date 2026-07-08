import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import ParagraphRichText from './ParagraphRichText';
import { normalizeLinkUrl } from '../lib/security';

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

describe('ParagraphRichText', () => {
  it('renders unsafe links as inert text', () => {
    const html = renderToStaticMarkup(
      <ParagraphRichText
        content={[
          {
            type: 'paragraph',
            children: [
              {
                type: 'link',
                url: 'javascript:alert(1)',
                children: [{ type: 'text', text: 'Click me' }],
              },
            ],
          },
        ]}
      />
    );

    expect(html).toContain('Click me');
    expect(html).not.toContain('<a ');
    expect(html).not.toContain('href=');
  });

  it('drops unknown block types instead of rendering raw markup', () => {
    const html = renderToStaticMarkup(
      <ParagraphRichText
        content={[
          {
            type: 'html',
            children: [{ type: 'text', text: '<img src=x onerror=alert(1)>' }],
          },
        ]}
      />
    );

    expect(html).toBe('');
  });
});
