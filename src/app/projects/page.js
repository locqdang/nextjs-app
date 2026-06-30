import ProjectCard from '../../components/ProjectCard';
import { fetchStrapiEntries } from '../../lib/data';
import { formatMediaURL } from '../../lib/data/strapi';

export const revalidate = 3600;

export default async function ProjectsPage() {
  // Fetch full projects list from Strapi; fail soft so route still renders.
  let projects = [];
  try {
    projects = await fetchStrapiEntries('projects', { populate: '*' });
  } catch {
    projects = [];
  }

  // Normalize Strapi media paths to render-safe URLs for logos/thumbnails.
  projects.forEach((project) => {
    if (project.logo?.url) project.logo.url = formatMediaURL(project.logo.url);
    for (const key of Object.keys(project.logo?.formats || {})) {
      if (project.logo.formats[key]?.url) {
        project.logo.formats[key].url = formatMediaURL(project.logo.formats[key].url);
      }
    }
  });

  return (
    <main>
      <section className="section projects-index">
        <header className="projects-index__hero">
          <p className="projects-index__eyebrow">Vietpolyglots Projects</p>
          <h1>Projects</h1>
        </header>
        <div className="grid">
          {projects?.map((project) => (
            <ProjectCard key={project.id ?? project.slug ?? project.name} project={project} />
          ))}
        </div>
      </section>
    </main>
  );
}
