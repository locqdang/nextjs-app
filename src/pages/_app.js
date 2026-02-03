import { useState } from "react";
import "../styles/globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { AuthProvider, RequireAuth } from "../lib/auth";
import { useGoogleOneTap } from "../hooks/useGoogleOneTap";

function AppContent({ Component, pageProps, privatePages, googleError, setGoogleError }) {
  // Initialize Google One Tap on all pages (inside AuthProvider)
  useGoogleOneTap({
    showPrompt: true,
    onError: (errorMessage) => setGoogleError(errorMessage),
  });

  return (
    <>
      <Navbar />
      {googleError && (
        <div className="fixed top-4 right-4 bg-red-50 border border-red-200 text-red-700 rounded p-4 z-50">
          {googleError}
        </div>
      )}
      <RequireAuth privatePages={privatePages}>
        <Component {...pageProps} />
      </RequireAuth>
      <Footer />
    </>
  );
}

export default function App({ Component, pageProps }) {
  const privatePages = ["/secret"];
  const [googleError, setGoogleError] = useState("");

  return (
    <AuthProvider>
      <AppContent
        Component={Component}
        pageProps={pageProps}
        privatePages={privatePages}
        googleError={googleError}
        setGoogleError={setGoogleError}
      />
    </AuthProvider>
  );
}