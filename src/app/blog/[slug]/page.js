import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import BlogAuthor from '../../../components/BlogAuthor';
import BlogRichText from '../../../components/BlogRichText';
import { fetchBlogPostBySlug, fetchBlogPosts, formatBlogDate } from '../../../lib/blog-posts';

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const posts = await fetchBlogPosts();
    return posts.map((post) => ({ slug: post.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await fetchBlogPostBySlug(slug);

  if (!post) {
    return {
      title: 'Blog post not found | Vietpolyglots',
    };
  }

  return {
    title: `${post.title} | Vietpolyglots`,
    description: post.excerpt,
  };
}

function renderParagraphContent(paragraph) {
  if (Array.isArray(paragraph.richText) && paragraph.richText.length) {
    return <BlogRichText content={paragraph.richText} />;
  }

  return String(paragraph.text || '')
    .split(/\n{2,}/)
    .map((text) => text.trim())
    .filter(Boolean)
    .map((text) => <p key={text}>{text}</p>);
}

function BlogMedia({ mediaBlock }) {
  const media = mediaBlock?.media;
  const imageUrl = media?.formats?.large?.url ?? media?.formats?.medium?.url ?? media?.url;

  if (!imageUrl || mediaBlock?.type === 'video') return null;

  return (
    <figure className="blog-post__media">
      <Image
        src={imageUrl}
        alt={mediaBlock?.altText || media?.alternativeText || mediaBlock?.caption || ''}
        width={media?.formats?.large?.width ?? media?.width ?? 1000}
        height={media?.formats?.large?.height ?? media?.height ?? 650}
        sizes="(max-width: 768px) 100vw, 820px"
      />
      {mediaBlock?.caption ? <figcaption>{mediaBlock.caption}</figcaption> : null}
    </figure>
  );
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = await fetchBlogPostBySlug(slug);

  if (!post) notFound();

  return (
    <main>
      <article className="blog-post">
        <Link className="blog-post__back" href="/blog">
          ← Back to blog
        </Link>

        <header className="blog-post__hero">
          <p className="blog-post__date">{formatBlogDate(post.date ?? post.publishedAt)}</p>
          <BlogAuthor authors={post.authors} />
          <h1>{post.title}</h1>
          {post.excerpt ? <p className="blog-post__excerpt">{post.excerpt}</p> : null}
        </header>

        <div className="blog-post__content">
          {post.paragraphs.map((paragraph) => (
            <section className="blog-post__section" key={paragraph.id ?? paragraph.title}>
              {paragraph.title ? <h2>{paragraph.title}</h2> : null}
              <BlogMedia mediaBlock={paragraph.ParagraphMedia} />
              {renderParagraphContent(paragraph)}
            </section>
          ))}
        </div>

        {post.authors?.length ? (
          <footer className="blog-post__author-bio">
            <BlogAuthor authors={post.authors} showBio />
          </footer>
        ) : null}
      </article>
    </main>
  );
}
