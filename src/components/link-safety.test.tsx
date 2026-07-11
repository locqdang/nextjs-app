import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

import BlogAuthor from './BlogAuthor';

describe('BlogAuthor', () => {
  it('renders author names as plain text when profile links are unsafe', () => {
    const html = renderToStaticMarkup(
      <BlogAuthor
        showBio
        authors={[
          {
            id: 1,
            name: 'Unsafe Author',
            profile_link: 'javascript:alert(1)',
            bio: 'Bio',
          },
        ]}
      />
    );

    expect(html).toContain('Unsafe Author');
    expect(html).toContain('Bio');
    expect(html).not.toContain('href=');
    expect(html).not.toContain('View public profile');
  });

  it('hardens external profile links with safe anchor attributes', () => {
    const html = renderToStaticMarkup(
      <BlogAuthor
        showBio
        authors={[
          {
            id: 2,
            name: 'Safe Author',
            profile_link: 'https://example.com/profile',
          },
        ]}
      />
    );

    expect(html).toContain('href="https://example.com/profile"');
    expect(html).toContain('rel="nofollow noopener noreferrer"');
    expect(html).toContain('target="_blank"');
  });
});
