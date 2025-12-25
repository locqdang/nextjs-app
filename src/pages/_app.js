import "../styles/globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function App({ Component, pageProps }) {
  // Extract navbar data from pageProps (which comes from getServerSideProps)
  const navbarData = pageProps.navbar || {};

  return (
    <>
      <Navbar data={navbarData} />
      <Component {...pageProps} />
      <Footer />
    </>
  );
}