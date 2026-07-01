import type { BlogTocItem } from '../lib/blog-toc';

type BlogTocProps = {
  items: BlogTocItem[];
};

export default function BlogToc({ items }: BlogTocProps) {
  if (!items.length) return null;

  return (
    <aside className="blog-post__toc" aria-labelledby="blog-post-toc-title">
      <p className="blog-post__toc-eyebrow">On this page</p>
      <h2 id="blog-post-toc-title">Table of contents</h2>
      <nav className="blog-post__toc-nav" aria-label="Table of contents">
        <ol className="blog-post__toc-list">
          {items.map((item) => (
            <li
              className={`blog-post__toc-item blog-post__toc-item--level-${item.level}`}
              key={item.id}
            >
              <a href={`#${item.id}`}>{item.text}</a>
            </li>
          ))}
        </ol>
      </nav>
    </aside>
  );
}
