import Image from 'next/image';
import Link from 'next/link';
import { fetchBlogPosts, formatBlogDate, getBlogPostUrl } from '../../lib/blog-posts';

export const revalidate = 3600;

export const metadata = {
  title: 'Blog | Vietpolyglots',
  description: 'Articles about technology, languages, work, and learning from Vietpolyglots.',
};

function getPostImage(post) {
  for (const paragraph of post.paragraphs || []) {
    const mediaBlock = paragraph?.ParagraphMedia;
    const media = mediaBlock?.media;
    const imageUrl = media?.formats?.large?.url ?? media?.formats?.medium?.url ?? media?.url;

    if (imageUrl && mediaBlock?.type !== 'video') {
      return {
        src: imageUrl,
        alt: mediaBlock?.altText || media?.alternativeText || mediaBlock?.caption || post.title,
        width: media?.formats?.large?.width ?? media?.width ?? 1000,
        height: media?.formats?.large?.height ?? media?.height ?? 650,
      };
    }
  }

  return null;
}

function Authors({ authors = [], compact = false }) {
  if (!authors.length) return null;

  return (
    <div className={compact ? 'blog-authors blog-authors--compact' : 'blog-authors'}>
      {authors.map((author) => {
        const photoUrl = author.photo?.formats?.thumbnail?.url ?? author.photo?.url;
        const name = author.name || author.title;
        const nameNode = author.profile_link ? (
          <a href={author.profile_link} target="_blank" rel="noreferrer">
            {name}
          </a>
        ) : (
          name
        );

        return (
          <div className="blog-author" key={author.documentId ?? author.id ?? name}>
            {photoUrl ? (
              <Image
                src={photoUrl}
                alt={author.photo?.alternativeText || name}
                width={compact ? 32 : 44}
                height={compact ? 32 : 44}
                className="blog-author__photo"
              />
            ) : null}
            <div>
              <p className="blog-author__label">Written by</p>
              <p className="blog-author__name">{nameNode}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BlogCard({ post, featured = false }) {
  const image = getPostImage(post);
  const href = getBlogPostUrl(post);

  return (
    <article className={featured ? 'blog-card blog-card--featured' : 'blog-card'}>
      {image ? (
        <Link className="blog-card__image-link" href={href} aria-label={`Read ${post.title}`}>
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            sizes={featured ? '(max-width: 900px) 100vw, 520px' : '(max-width: 768px) 100vw, 360px'}
            className="blog-card__image"
          />
        </Link>
      ) : null}

      <div className="blog-card__body">
        <p className="blog-card__date">{formatBlogDate(post.date ?? post.publishedAt)}</p>
        <Authors authors={post.authors} compact={!featured} />
        <h3 className="blog-card__title">
          <Link href={href}>{post.title}</Link>
        </h3>
        {post.excerpt ? <p className="blog-card__excerpt">{post.excerpt}</p> : null}
        <Link className="blog-card__read-more" href={href}>
          Read article <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}

export default async function BlogPage() {
  let posts = [];

  try {
    posts = await fetchBlogPosts();
  } catch {
    posts = [];
  }

  const [featuredPost, ...olderPosts] = posts;

  return (
    <main>
      <section className="blog-index">
        <header className="blog-index__hero">
          <p className="blog-index__eyebrow">Vietpolyglots Blog</p>
          <h1>Ideas on technology, learning, and work</h1>
          <p>
            Practical notes and longer-form essays from Vietpolyglots — starting with how AI may
            reshape work without removing the human part of it.
          </p>
          {posts.length ? (
            <p className="blog-index__count">
              {posts.length} {posts.length === 1 ? 'article' : 'articles'} published
            </p>
          ) : null}
        </header>

        {featuredPost ? (
          <>
            <section className="blog-index__featured" aria-labelledby="latest-blog-post">
              <div className="blog-index__section-heading">
                <p>Latest article</p>
                <h2 id="latest-blog-post">Start here</h2>
              </div>
              <BlogCard post={featuredPost} featured />
            </section>

            {olderPosts.length ? (
              <section className="blog-index__archive" aria-labelledby="more-blog-posts">
                <div className="blog-index__section-heading">
                  <p>Archive</p>
                  <h2 id="more-blog-posts">More posts</h2>
                </div>
                <div className="blog-grid">
                  {olderPosts.map((post) => (
                    <BlogCard post={post} key={post.documentId ?? post.id ?? post.slug} />
                  ))}
                </div>
              </section>
            ) : null}
          </>
        ) : (
          <section className="blog-empty">
            <h2>No blog posts yet</h2>
            <p>Articles from Strapi will appear here after they are published.</p>
          </section>
        )}
      </section>
    </main>
  );
}
