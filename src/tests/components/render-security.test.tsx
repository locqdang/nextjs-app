import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={typeof href === 'string' ? href : String(href)} {...props}>
      {children}
    </a>
  ),
}));

import Breadcrumbs from '../../components/Breadcrumbs';
import ParagraphRichText from '../../components/ParagraphRichText';
import StructuredData from '../../components/StructuredData';

describe('render-path security hardening', () => {
  it('renders malformed breadcrumb path segments as inert text instead of throwing', () => {
    expect(() => renderToStaticMarkup(<Breadcrumbs pathname="/blog/%E0%A4%A" />)).not.toThrow();

    const html = renderToStaticMarkup(<Breadcrumbs pathname="/blog/%E0%A4%A" />);
    expect(html).toContain('BLOG');
    expect(html).toContain('%E0%A4%A');
  });

  it('renders unsafe rich-text links as inert text', () => {
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
    expect(html).not.toContain('href=');
    expect(html).not.toContain('javascript:alert(1)');
  });

  it('keeps JSON-LD payload inert inside the documented raw-script exception', () => {
    const html = renderToStaticMarkup(
      <StructuredData data={{ dangerous: '</script><script>alert(1)</script>' }} />
    );

    expect(html).toContain('type="application/ld+json"');
    expect(html).toContain('\\u003c/script\\u003e\\u003cscript\\u003ealert(1)\\u003c/script\\u003e');
    expect(html.match(/<script/g)?.length).toBe(1);
  });
});
