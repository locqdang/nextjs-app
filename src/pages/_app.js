import "../styles/globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { AuthProvider, RequireAuth } from "../lib/auth";
import { useGoogleOneTap } from "../hooks/useGoogleOneTap";

function AppContent({Component, pageProps}){
  const privatePages = ["/secret"];

  // use google one tap
  useGoogleOneTap();

  return (
    <>
      <Navbar />
      <RequireAuth privatePages={privatePages}>
      <Component {...pageProps} />
      </RequireAuth>
      <Footer />
    </>
  );
}

export default function App({ Component, pageProps }) {
  return (
    <>
      <AuthProvider>
        <AppContent Component={Component} pageProps={pageProps}/>
      </AuthProvider>
    </>
  
  )
  
}