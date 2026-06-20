import Image from 'next/image';
import Link from 'next/link';
import { formatBlogDate, getBlogPostUrl } from '../lib/blog-posts';
import BlogAuthor from './BlogAuthor';

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

export default function BlogCard({ post, featured = false }) {
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
        <BlogAuthor authors={post.authors} compact={!featured} />
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
