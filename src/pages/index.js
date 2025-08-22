import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import ProjectCard from "../components/ProjectCard";
import Footer from "@/components/Footer";

export default function Home() {
  const projects = [
    {
      title: "Storefront Revamp",
      description:
        "A fast, SEO-friendly ecommerce front end built with Next.js and SSR.",
      href: "/projects/storefront",
      tags: ["Next.js", "SSR", "SEO"],
    },
    {
      title: "Content API",
      description:
        "Headless CMS integration (Strapi) with role-based auth and webhooks.",
      href: "/projects/content-api",
      tags: ["Strapi", "Node", "REST"],
    },
    {
      title: "Tic-Tac-Toe",
      description:
        "A classic game with React state and clean component design.",
      href: "/games/tic-tac-toe",
      tags: ["React", "Hooks"],
    },
  ];

  return (
    <>
      <Navbar />
      <main>
        <Hero />

        <section id="projects" className="section">
          <div className="section__header">
            <h2>Featured Projects</h2>
            <p>Three recent builds showcasing performance, DX, and UX.</p>
          </div>

          <div className="grid">
            {projects.map((p) => (
              <ProjectCard key={p.title} {...p} />
            ))}
          </div>
        </section>

        <section id="contact" className="section section--muted">
          <div className="section__header">
            <h2>Let’s work together</h2>
            <p>
              Email me at <a href="mailto:quacktothetenth@duck.com">quacktothetenth@duck.com</a>
            </p>
          </div>
        </section>
      </main>

      <Footer/>
    </>
  );
}
