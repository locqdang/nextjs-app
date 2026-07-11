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
  nonce?: string;
};

export default function AppShell({ children, navbarData = null, nonce }: AppShellProps) {
  const [googleReady, setGoogleReady] = useState(false);
  useGoogleOneTap(googleReady);

  const pathname = usePathname();

  return (
    <>
      <Script
        id="gtm-loader"
        nonce={nonce}
        src="https://www.googletagmanager.com/gtm.js?id=GTM-TNTD5HRS"
        strategy="afterInteractive"
      />
      <Script
        nonce={nonce}
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setGoogleReady(true)}
      />
      <Navbar data={navbarData ?? undefined} />
      {pathname && pathname !== '/' && <Breadcrumbs pathname={pathname} />}
      {children}
      <Footer />
    </>
  );
}
