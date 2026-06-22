import type { Metadata } from 'next';
import '../styles/globals.css';
import '../styles/blog.css';
import '../styles/breadcrumbs.css';
import Providers from './providers';
import AppShell from './app-shell';
import { fetchFromStrapi } from '../lib/data';

export const metadata: Metadata = {
  title: 'Vietpolyglots',
  description: 'Vietpolyglots website',
};

export const revalidate = 3600;

async function getNavbarData() {
  try {
    const response = await fetchFromStrapi('navbar', {
      queryParams: {
        'populate[logo][populate]': '*',
        'populate[fixedMenu][populate][subItems][populate]': '*',
        'populate[dynamicMenu][populate][subItems][populate]': '*',
      },
    });

    const navbar = response?.data?.attributes ?? response?.data ?? null;

    if (!navbar) return null;

    return {
      brand: navbar.brand ?? 'Vietpolyglots',
      logo: navbar.logo ?? null,
      fixedMenu: Array.isArray(navbar.fixedMenu) ? navbar.fixedMenu : [],
      dynamicMenu: Array.isArray(navbar.dynamicMenu) ? navbar.dynamicMenu : [],
    };
  } catch {
    return null;
  }
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const navbarData = await getNavbarData();

  return (
    <html lang="en">
      <body>
        <Providers>
          <AppShell navbarData={navbarData}>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
