import ProjectCard from "../components/ProjectCard";
import { fetchProjects } from "../lib/projects";
import { formatMediaURL } from "../lib/strapi";
import { fetchNavbar } from "../lib/navbar";


export default function ProjectsPage({ projects }) {
      projects.forEach((p) => {
        if (p.logo) {
          if (p.logo.url) p.logo.url = formatMediaURL(p.logo.url);
          for (const k of Object.keys(p.logo.formats || {})) {
            if (p.logo.formats[k]?.url)
              p.logo.formats[k].url = formatMediaURL(p.logo.formats[k].url);
          }
        }
      });

    return(
        <main>


            <section className="section">
                 <div className="grid">
                {
                    projects?.map((p) => (
                        <ProjectCard key={p.id ?? p.slug ?? p.name} project={p} />
                    ))
                }
            </div>
            </section>
        </main>

    );

}

export async function getServerSideProps(){
    const fetchedProjects = await fetchProjects();
    const projects = fetchedProjects?.data?? fetchedProjects.data ?? [];

    const ferchedNavbar = await fetchNavbar();
    const navbar = ferchedNavbar?.data ?? ferchedNavbar ?? {};

    return {props:{projects, navbar}};
}