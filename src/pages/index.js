import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import ProjectCard from "../components/ProjectCard";
import { fetchHomepage } from "../lib/homepage";
import { fetchNavbar } from "../lib/navbar";
import Footer from "../components/Footer";

export default function Home(props) {
  const heroData = props.homepage?.hero ?? null;
  const featuredProjects = [];
  featuredProjects.push(props.homepage.project0);
  featuredProjects.push(props.homepage.project1);
  featuredProjects.push(props.homepage.project2);

  // fix project photo url
  const BASE = process.env.STRAPI_URL || "https://strapi.vietpolyglots.com";
  const abs = (u) => (u?.startsWith("/") ? BASE + u : u);
  featuredProjects.forEach((p) => {
    if (p.logo) {
      if (p.logo.url) p.logo.url = abs(p.logo.url);
      for (const k of Object.keys(p.logo.formats || {})) {
        if (p.logo.formats[k]?.url)
          p.logo.formats[k].url = abs(p.logo.formats[k].url);
      }
    }
  });

  return (
    <>
      {/* <Navbar data={props.navbar} /> */}
      <main>
        <Hero data={heroData} />

        <section id="projects" class="section">
          <div class="section__header">
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
              Email me at{" "}
              <a href="mailto:locqdang@gmail.com">locqdang@gmail.com</a>
            </p>
          </div>
        </section>
      </main>

      {/* <Footer /> */}
    </>
  );
}

export async function getServerSideProps() {
  const homepageJson = await fetchHomepage();
  const homepage = homepageJson?.data?.attributes ?? homepageJson?.data ?? {};

  const navbarJson = await fetchNavbar();
  const navbar = navbarJson?.data?.attributes ?? navbarJson?.data ?? {};

  return { props: { homepage, navbar } };
}
