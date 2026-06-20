import BlogCard from '../../components/BlogCard';
import { fetchBlogPosts } from '../../lib/blog-posts';

export const revalidate = 3600;

export const metadata = {
  title: 'Blog | Vietpolyglots',
  description: 'Articles about technology, languages, work, and learning from Vietpolyglots.',
};

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
