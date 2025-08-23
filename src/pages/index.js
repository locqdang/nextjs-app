import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import { fetchHomepage } from "../../lib/homepage";
import { fetchNavbar } from "../../lib/navbar";
export default function Home({ entry, navbar }) {
  const heroData = entry?.hero ?? null;

  return (
    <>
      <Navbar data={navbar}/>
      <main>
        <Hero data={heroData} />
      </main>
    </>
  );
}

export async function getServerSideProps() {
  const homepage = await fetchHomepage();
  const entry = homepage?.data?.attributes ?? homepage?.data ?? {};

  const navbarJson = await fetchNavbar();
  const navbar = navbarJson?.data?.attributes ?? navbarJson?.data ?? {};

  return { props: { entry, navbar } };
}
