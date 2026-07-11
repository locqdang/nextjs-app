import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={typeof href === 'string' ? href : String(href)} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

import BlogAuthor from '../../components/BlogAuthor';
import BlogParagraph from '../../components/BlogParagraph';

describe('blog detail security rendering', () => {
  it('renders blog paragraph rich-text payloads as inert markup on the detail page', () => {
    const html = renderToStaticMarkup(
      <BlogParagraph
        paragraph={{
          title: '<img src=x onerror=alert(1)>',
          richText: [
            {
              type: 'paragraph',
              children: [
                { type: 'text', text: '<script>alert(1)</script>' },
                {
                  type: 'link',
                  url: 'javascript:alert(1)',
                  children: [{ type: 'text', text: 'Unsafe link' }],
                },
              ],
            },
          ],
        }}
        sectionId="safe-heading"
      />
    );

    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).toContain('Unsafe link');
    expect(html).not.toContain('javascript:alert(1)');
    expect(html).not.toContain('href="javascript:alert(1)"');
  });

  it('fails closed on unsafe blog author profile links while preserving safe text rendering', () => {
    const html = renderToStaticMarkup(
      <BlogAuthor
        authors={[
          {
            name: '<b>Author</b>',
            bio: '<script>alert(1)</script>',
            profile_link: 'javascript:alert(1)',
            photo: {
              url: 'https://strapi.vietpolyglots.com/uploads/author.jpg',
              alternativeText: 'Author photo',
            },
          },
        ]}
        showBio
      />
    );

    expect(html).toContain('&lt;b&gt;Author&lt;/b&gt;');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).not.toContain('javascript:alert(1)');
    expect(html).not.toContain('View public profile');
  });
});
