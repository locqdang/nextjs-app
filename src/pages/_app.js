import "../styles/globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { AuthProvider, RequireAuth } from "../lib/auth";

export default function App({ Component, pageProps }) {
  const privatePages = ["/secret"];

  return (
    <AuthProvider>
      <Navbar />
      <RequireAuth privatePages={privatePages}>
        <Component {...pageProps} />
      </RequireAuth>
      <Footer />
    </AuthProvider>
  );
}