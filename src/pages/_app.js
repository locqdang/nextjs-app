import Script from "next/script";
import { useState } from "react";
import "../styles/globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { AuthProvider, RequireAuth } from "../lib/auth";
import { useGoogleOneTap } from "../hooks/useGoogleOneTap";

function AppContent({Component, pageProps}){
  const privatePages = ["/haro"];

  // Use google one tap
  const [googleReady, setGoogleReady] = useState(false);
  useGoogleOneTap(googleReady);

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={()=>setGoogleReady(true)}
      />
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