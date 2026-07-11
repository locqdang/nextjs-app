import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import type { Metadata } from 'next';
import BlogParagraph from '../../components/BlogParagraph';
import StructuredData from '../../components/StructuredData';
import { fetchStrapiEntries } from '../../lib/data';

type AboutPageEntry = {
  id?: number | string;
  documentId?: string;
  title?: string | null;
  route?: string | null;
  paragraphs?: Array<Parameters<typeof BlogParagraph>[0]['paragraph']>;
  seo?: {
    metaTitle?: string | null;
    metaDescription?: string | null;
    keywords?: string | null;
    structuredData?: Record<string, unknown> | string | null;
  } | null;
};

export const revalidate = 3600;

async function fetchAboutPage(): Promise<AboutPageEntry | null> {
  const pages = await fetchStrapiEntries('pages', {
    filters: {
      'route][$eq': '/about',
    },
    queryParams: {
      'populate[paragraphs][populate][ParagraphMedia][populate]': '*',
      'populate[seo][populate]': '*',
    },
  });

  return pages[0] ?? null;
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchAboutPage();

  return {
    title: page?.seo?.metaTitle || `${page?.title || 'About'} | Vietpolyglots`,
    description:
      page?.seo?.metaDescription ||
      'Learn more about Loc Dang, the person behind Vietpolyglots, including language learning, web development, and automation work.',
    keywords: page?.seo?.keywords || undefined,
  };
}

export default async function AboutPage() {
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  const page = await fetchAboutPage();

  if (!page) {
    notFound();
  }

  const paragraphs = Array.isArray(page.paragraphs) ? page.paragraphs : [];

  return (
    <main>
      <div className="blog-post">
        <StructuredData data={page.seo?.structuredData} nonce={nonce} />
        <header className="blog-post__hero">
          <p className="blog-index__eyebrow">About Vietpolyglots</p>
          <h1>{page.title || 'About'}</h1>
        </header>

        {paragraphs.length ? (
          paragraphs.map((paragraph) => (
            <BlogParagraph
              key={paragraph.id ?? paragraph.title ?? JSON.stringify(paragraph.richText ?? [])}
              paragraph={paragraph}
            />
          ))
        ) : (
          <section className="blog-empty">
            <h2>About content is coming soon.</h2>
            <p>Please check back later for updates.</p>
          </section>
        )}
      </div>
    </main>
  );
}
