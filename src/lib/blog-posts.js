import { fetchStrapiEntries } from './data';
import { formatMediaURL } from './data/strapi';

const BLOG_POSTS_POPULATE = {
  'populate[paragraphs][populate][ParagraphMedia][populate]': '*',
  'populate[authors][populate]': '*',
};

export function slugifyBlogPost(post) {
  const source = post?.slug || post?.title || `blog-post-${post?.id}`;

  return String(source)
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getBlogPostUrl(post) {
  return `/blog/${slugifyBlogPost(post)}`;
}

export function formatBlogDate(date) {
  if (!date) return null;

  return new Intl.DateTimeFormat('en', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(date));
}

function normalizeMedia(media) {
  if (!media) return null;

  const normalized = { ...media };
  if (normalized.url) normalized.url = formatMediaURL(normalized.url);

  normalized.formats = { ...(normalized.formats || {}) };
  for (const key of Object.keys(normalized.formats)) {
    if (normalized.formats[key]?.url) {
      normalized.formats[key] = {
        ...normalized.formats[key],
        url: formatMediaURL(normalized.formats[key].url),
      };
    }
  }

  return normalized;
}

function getAuthorName(author) {
  const adminName = [author?.admin_user?.firstname, author?.admin_user?.lastname]
    .filter(Boolean)
    .join(' ')
    .trim();

  return adminName || author?.title || 'Vietpolyglots';
}

function flattenRichText(value) {
  if (!value) return null;
  if (typeof value === 'string') return value;

  if (Array.isArray(value)) {
    return value
      .map((block) => flattenRichText(block))
      .filter(Boolean)
      .join('\n\n');
  }

  if (Array.isArray(value.children)) {
    return value.children
      .map((child) => flattenRichText(child))
      .filter(Boolean)
      .join('');
  }

  return value.text || null;
}

function normalizeAuthor(author) {
  return {
    ...author,
    name: getAuthorName(author),
    bio: flattenRichText(author?.bio),
    photo: normalizeMedia(author?.photo),
  };
}

function normalizeTag(tag) {
  const normalized = tag?.attributes ? { id: tag.id, ...tag.attributes } : { ...tag };

  return {
    ...normalized,
    name: normalized.name || normalized.title || normalized.label || normalized.slug,
  };
}

export function normalizeBlogPost(post) {
  const normalized = post?.attributes ? { id: post.id, ...post.attributes } : { ...post };

  return {
    ...normalized,
    slug: slugifyBlogPost(normalized),
    isFeatured: normalized.isFeatured === true,
    authors: (normalized.authors || []).map(normalizeAuthor),
    tags: (normalized.tags || []).map(normalizeTag),
    paragraphs: (normalized.paragraphs || []).map((paragraph) => ({
      ...paragraph,
      ParagraphMedia: paragraph.ParagraphMedia
        ? {
            ...paragraph.ParagraphMedia,
            media: normalizeMedia(paragraph.ParagraphMedia.media),
          }
        : null,
    })),
  };
}

export async function fetchBlogPosts() {
  const posts = await fetchStrapiEntries('blog-posts', {
    queryParams: BLOG_POSTS_POPULATE,
    sort: 'date:desc',
    pagination: { pageSize: 25 },
  });

  return posts.map(normalizeBlogPost);
}

export async function fetchBlogPostBySlug(slug) {
  const posts = await fetchBlogPosts();
  return posts.find((post) => post.slug === slug) ?? null;
}
