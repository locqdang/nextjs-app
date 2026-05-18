import ProjectCard from '../components/ProjectCard';
import { fetchStrapiEntries } from '../lib/data';
import { formatMediaURL } from '../lib/data/strapi';

export default function ProjectsPage({ projects }) {
  projects.forEach((p) => {
    if (p.logo) {
      if (p.logo.url) p.logo.url = formatMediaURL(p.logo.url);
      for (const k of Object.keys(p.logo.formats || {})) {
        if (p.logo.formats[k]?.url) p.logo.formats[k].url = formatMediaURL(p.logo.formats[k].url);
      }
    }
  });

  return (
    <main>
      <section className="section">
        <div className="grid">
          {projects?.map((p) => (
            <ProjectCard key={p.id ?? p.slug ?? p.name} project={p} />
          ))}
        </div>
      </section>
    </main>
  );
}

export async function getStaticProps() {
  const projects = await fetchStrapiEntries('projects', { populate: '*' });

  return { props: { projects }, revalidate: 3600 };
}
