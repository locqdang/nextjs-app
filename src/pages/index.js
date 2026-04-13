import Hero from '../components/Hero';
import ProjectCard from '../components/ProjectCard';
import { fetchHomepage } from '../lib/homepage';
import { formatMediaURL } from '../lib/strapi';

export default function Home(props) {
  const heroData = props.homepage?.hero ?? null;
  const featuredProjects = [];
  featuredProjects.push(props.homepage.project0);
  featuredProjects.push(props.homepage.project1);
  featuredProjects.push(props.homepage.project2);

  // fix project photo url
  featuredProjects.forEach((p) => {
    if (p.logo) {
      if (p.logo.url) p.logo.url = formatMediaURL(p.logo.url);
      for (const k of Object.keys(p.logo.formats || {})) {
        if (p.logo.formats[k]?.url) p.logo.formats[k].url = formatMediaURL(p.logo.formats[k].url);
      }
    }
  });

  return (
    <>
      <main>
        <Hero data={heroData} />

        <section id="projects" className="section">
          <div className="section__header">
            <h2> Featured Projects </h2>
            <p> My recent projects</p>
          </div>
          <div className="grid">
            {featuredProjects.map((p) => (
              <ProjectCard key={p.id ?? p.slug ?? p.name} project={p} />
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
    </>
  );
}

export async function getStaticProps() {
  const fetchedHomePage = await fetchHomepage();
  const homepage = fetchedHomePage?.data?.attributes ?? fetchedHomePage?.data ?? {};

  return { props: { homepage }, revalidate: 3600 };
}
