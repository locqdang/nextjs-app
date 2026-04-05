import Script from "next/script";
import { useState } from "react";
import "../styles/globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { AuthProvider, RequireAuth } from "../lib/auth";
import { useGoogleOneTap } from "../hooks/useGoogleOneTap";

function AppContent({Component, pageProps}){
  const privatePages = ["/haro", "/video-meeting"];

  // Use google one tap
  const [googleReady, setGoogleReady] = useState(false);
  useGoogleOneTap(googleReady);

  return (
    <>
      <Script id="gtm" strategy="afterInteractive">
        {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-TNTD5HRS');
        `}
      </Script>
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