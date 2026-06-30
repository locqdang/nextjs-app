import Hero from '../components/Hero';
import ProjectCard from '../components/ProjectCard';
import { fetchFromStrapi } from '../lib/data';
import { formatMediaURL } from '../lib/data/strapi';
import StructuredData from '../components/StructuredData';

export const revalidate = 3600;

export default async function HomePage() {
  // Fetch homepage content from Strapi; fall back gracefully if CMS is unavailable.
  let fetchedHomePage = null;
  try {
    fetchedHomePage = await fetchFromStrapi('homepage', {
      queryParams: {
        'populate[hero][populate]': '*',
        'populate[project0][populate]': '*',
        'populate[project1][populate]': '*',
        'populate[project2][populate]': '*',
        'populate[blogPost0][populate]': '*',
        'populate[blogPost1][populate]': '*',
        'populate[blogPost2][populate]': '*',
        'populate[seo][populate]': '*',
      },
    });
  } catch {
    fetchedHomePage = null;
  }
  // Normalize Strapi response shape (v4/v5 style) into one predictable object.
  const homepage = fetchedHomePage?.data?.attributes ?? fetchedHomePage?.data ?? {};
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
            Email me at <a href="mailto:locqdang@gmail.com">locqdang@gmail.com</a>
          </p>
        </div>
      </section>
    </main>
  );
}
