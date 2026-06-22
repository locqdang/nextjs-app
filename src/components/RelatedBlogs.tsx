import Link from 'next/link';
import { getBlogPostUrl } from '../lib/blog-posts';

type BlogTag = {
  id?: string | number;
  documentId?: string;
  name?: string;
  title?: string;
  slug?: string;
};

type RelatedBlogPost = {
  id?: string | number;
  documentId?: string;
  title: string;
  slug?: string;
  tags?: BlogTag[];
};

type RelatedBlogsProps = {
  currentPost: RelatedBlogPost;
  posts: RelatedBlogPost[];
  limit?: number;
};

function getPostKey(post: RelatedBlogPost) {
  return post.documentId ?? post.id ?? post.slug ?? post.title;
}

function getTagKey(tag: BlogTag) {
  return tag.slug ?? tag.documentId ?? tag.id ?? tag.name ?? tag.title;
}

function getRelatedPosts(currentPost: RelatedBlogPost, posts: RelatedBlogPost[], limit: number) {
  const currentPostKey = getPostKey(currentPost);
  const currentTagKeys = new Set((currentPost.tags || []).map(getTagKey).filter(Boolean));
  const otherPosts = posts.filter((post) => getPostKey(post) !== currentPostKey);

  if (!currentTagKeys.size) {
    // The section label is intentionally neutral because current CMS data may not include tags yet.
    return otherPosts.slice(0, limit);
  }

  const relatedPosts = otherPosts
    .map((post) => {
      const score = (post.tags || []).reduce(
        (count, tag) => (currentTagKeys.has(getTagKey(tag)) ? count + 1 : count),
        0
      );
      return { post, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ post }) => post);

  const relatedPostKeys = new Set(relatedPosts.map(getPostKey));
  // Fill remaining slots with newest posts so the section stays useful when tag overlap is sparse.
  const newestFallbackPosts = otherPosts.filter((post) => !relatedPostKeys.has(getPostKey(post)));

  return [...relatedPosts, ...newestFallbackPosts].slice(0, limit);
}

export default function RelatedBlogs({ currentPost, posts, limit = 10 }: RelatedBlogsProps) {
  const relatedPosts = getRelatedPosts(currentPost, posts, limit);

  if (!relatedPosts.length) return null;

  return (
    <section className="related-blogs" aria-labelledby="related-blogs-title">
      <p className="related-blogs__eyebrow">Keep reading</p>
      <h2 id="related-blogs-title">Other blog posts</h2>
      <ul className="related-blogs__list">
        {relatedPosts.map((post) => (
          <li key={getPostKey(post)}>
            <Link href={getBlogPostUrl(post)}>{post.title}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
