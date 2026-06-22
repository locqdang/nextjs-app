import BlogCard from '../../components/BlogCard';
import { fetchBlogPosts } from '../../lib/blog-posts';

export const revalidate = 3600;

export const metadata = {
  title: 'Blog | Vietpolyglots',
  description: 'Articles from Vietpolyglots about technology, language learning, and work.',
};

export default async function BlogIndexPage() {
  const posts = await fetchBlogPosts();
  const getPostKey = (post) => post.documentId ?? post.id ?? post.slug;
  const strapiFeaturedPosts = posts.filter((post) => post.isFeatured === true).slice(0, 3);
  const featuredPosts = strapiFeaturedPosts.length ? strapiFeaturedPosts : posts.slice(0, 3);
  const featuredPostKeys = new Set(featuredPosts.map(getPostKey));
  const olderPosts = posts.filter((post) => !featuredPostKeys.has(getPostKey(post)));
  const articleCount = posts.length;

  return (
    <main>
      <div className="blog-index">
        <header className="blog-index__hero">
          <p className="blog-index__eyebrow">Vietpolyglots Blog</p>
          <h1>Ideas on technology, learning, and work</h1>
          <p>
            Practical notes and longer-form essays from Vietpolyglots — starting with how AI may reshape work without
            removing the human part of it.
          </p>
          {articleCount ? (
            <p className="blog-index__count">
              {articleCount} article{articleCount === 1 ? '' : 's'} published
            </p>
          ) : null}
        </header>

        {featuredPosts.length ? (
          <>
            <section className="blog-index__featured" aria-labelledby="featured-blog-posts">
              <div className="blog-index__section-heading">
                <p>Featured articles</p>
                <h2 id="featured-blog-posts">Start here</h2>
              </div>
              <div className="blog-featured-grid">
                {featuredPosts.map((post) => (
                  <BlogCard post={post} key={getPostKey(post)} />
                ))}
              </div>
            </section>

            {olderPosts.length ? (
              <section className="blog-index__archive" aria-labelledby="all-blog-posts">
                <div className="blog-index__section-heading">
                  <p>More reading</p>
                  <h2 id="all-blog-posts">All articles</h2>
                </div>
                <div className="blog-grid">
                  {olderPosts.map((post) => (
                    <BlogCard post={post} key={getPostKey(post)} />
                  ))}
                </div>
              </section>
            ) : null}
          </>
        ) : (
          <section className="blog-empty">
            <h2>Blog posts are coming soon.</h2>
            <p>Check back later for new articles from Vietpolyglots.</p>
          </section>
        )}
      </div>
    </main>
  );
}
