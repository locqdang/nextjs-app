import Link from 'next/link';
import { notFound } from 'next/navigation';
import BlogAuthor from '../../../components/BlogAuthor';
import BlogCoverImage from '../../../components/BlogCoverImage';
import BlogParagraph from '../../../components/BlogParagraph';
import RelatedBlogs from '../../../components/RelatedBlogs';
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

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = await fetchBlogPostBySlug(slug);
  const posts = await fetchBlogPosts();

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

        <BlogCoverImage title={post.title} coverImage={post.coverImage} />

        <div className="blog-post__content">
          {post.paragraphs.map((paragraph) => (
            <BlogParagraph paragraph={paragraph} key={paragraph.id ?? paragraph.title} />
          ))}
        </div>

        {post.authors?.length ? (
          <footer className="blog-post__author-bio">
            <BlogAuthor authors={post.authors} showBio />
          </footer>
        ) : null}

        <RelatedBlogs currentPost={post} posts={posts} />
      </article>
    </main>
  );
}
