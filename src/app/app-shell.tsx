'use client';

import Script from 'next/script';
import type { ReactNode } from 'react';
import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useGoogleOneTap } from '../hooks/useGoogleOneTap';
import { usePathname } from 'next/navigation';
import Breadcrumbs from '../components/Breadcrumbs';

type AppShellProps = {
  children: ReactNode;
  navbarData?: any;
};

export default function AppShell({ children, navbarData = null }: AppShellProps) {
  // Track when Google Identity script has loaded before initializing One Tap.
  const [googleReady, setGoogleReady] = useState(false);
  useGoogleOneTap(googleReady);

  const pathname = usePathname();

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
        // Mark Google SDK ready so One Tap can be initialized safely.
        onLoad={() => setGoogleReady(true)}
      />
      <Navbar data={navbarData ?? undefined} />
      {pathname && pathname !== '/' && <Breadcrumbs pathname={pathname} />}
      {children}
      <Footer />
    </>
  );
}
