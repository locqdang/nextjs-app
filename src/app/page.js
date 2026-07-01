import Hero from '../components/Hero';
import ProjectCard from '../components/ProjectCard';
import { fetchFromStrapi } from '../lib/data';
import { formatMediaURL } from '../lib/data/strapi';
import StructuredData from '../components/StructuredData';

export const revalidate = 3600;

const HOMEPAGE_QUERY_PARAMS = {
  'populate[hero][populate]': '*',
  'populate[project0][populate]': '*',
  'populate[project1][populate]': '*',
  'populate[project2][populate]': '*',
  'populate[blogPost0][populate]': '*',
  'populate[blogPost1][populate]': '*',
  'populate[blogPost2][populate]': '*',
  'populate[seo][populate]': '*',
};

async function fetchHomePage() {
  try {
    const fetchedHomePage = await fetchFromStrapi('homepage', {
      queryParams: HOMEPAGE_QUERY_PARAMS,
    });

    return fetchedHomePage?.data?.attributes ?? fetchedHomePage?.data ?? {};
  } catch {
    return {};
  }
}

export async function generateMetadata() {
  const homepage = await fetchHomePage();
  const title = homepage?.seo?.metaTitle || homepage?.hero?.headline || 'Vietpolyglots';
  const description =
    homepage?.seo?.metaDescription ||
    homepage?.hero?.subHealine ||
    homepage?.hero?.introText ||
    'Vietpolyglots website';
  const keywords = homepage?.seo?.keywords;
  const image = homepage?.seo?.shareImage?.url
    ? formatMediaURL(homepage.seo.shareImage.url)
    : undefined;
  const url = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://vietpolyglots.com';

  return {
    title,
    description,
    keywords: keywords || undefined,
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function HomePage() {
  const homepage = await fetchHomePage();
  const heroData = homepage?.hero ?? null;
  // Keep homepage project slots stable while ignoring empty entries.
  const featuredProjects = [homepage.project0, homepage.project1, homepage.project2].filter(
    Boolean
  );

  // Convert Strapi media paths to absolute/usable URLs for image rendering.
  featuredProjects.forEach((project) => {
    if (project.logo?.url) project.logo.url = formatMediaURL(project.logo.url);
    for (const key of Object.keys(project.logo?.formats || {})) {
      if (project.logo.formats[key]?.url) {
        project.logo.formats[key].url = formatMediaURL(project.logo.formats[key].url);
      }
    }
  });

  return (
    <main>
      <StructuredData data={homepage?.seo?.structuredData} />
      <Hero data={heroData} />

      <section id="projects" className="section">
        <div className="section__header">
          <h2> Featured Projects </h2>
          <p> My recent projects</p>
        </div>
        <div className="grid">
          {featuredProjects.map((project) => (
            <ProjectCard key={project.id ?? project.slug ?? project.name} project={project} />
          ))}
        </div>
      </section>

      <section id="contact" className="section section--muted">
        <div className="section__header">
          <h2>Let&apos;s work together</h2>
          <p>
            Email me at <a href="mailto:vietpolyglots@gmail.com">vietpolyglots@gmail.com</a>
          </p>
        </div>
      </section>
    </main>
  );
}
