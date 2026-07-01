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

function normalizePageNavLabel(title?: string | null, route?: string | null) {
  if (title?.trim()) return title.trim();
  if (route === '/about') return 'About';
  return 'Page';
}

function mergeNavbarPages(navbar: any, pages: any[] = []) {
  const dynamicMenu = Array.isArray(navbar.dynamicMenu) ? [...navbar.dynamicMenu] : [];
  const homeIndex = dynamicMenu.findIndex((item) => item?.url === '/' || item?.label === 'Home');

  if (homeIndex === -1) return dynamicMenu;

  const homeGroup = dynamicMenu[homeIndex] ?? {};
  const subItems = Array.isArray(homeGroup.subItems) ? [...homeGroup.subItems] : [];
  const existingUrls = new Set(
    [homeGroup.url, ...subItems.map((item) => item?.url)]
      .filter(Boolean)
      .map((url) => (String(url).startsWith('/') ? String(url) : `/${String(url)}`))
  );

  for (const page of pages) {
    const route = typeof page?.route === 'string' ? page.route.trim() : '';
    if (!route || route === '/' || route === '/projects' || route === '/blogs') continue;
    if (existingUrls.has(route)) continue;

    subItems.push({
      id: page.documentId ?? page.id ?? route,
      label: normalizePageNavLabel(page.title, route),
      url: route,
    });
    existingUrls.add(route);
  }

  dynamicMenu[homeIndex] = {
    ...homeGroup,
    subItems,
  };

  return dynamicMenu;
}

async function getNavbarData() {
  try {
    const [navbarResponse, pagesResponse] = await Promise.all([
      fetchFromStrapi('navbar', {
        queryParams: {
          'populate[logo][populate]': '*',
          'populate[fixedMenu][populate][subItems][populate]': '*',
          'populate[dynamicMenu][populate][subItems][populate]': '*',
        },
      }),
      fetchFromStrapi('pages', {
        queryParams: {
          fields: 'title,route,documentId',
          sort: 'title:asc',
        },
      }),
    ]);

    const navbar = navbarResponse?.data?.attributes ?? navbarResponse?.data ?? null;

    if (!navbar) return null;

    const pages = Array.isArray(pagesResponse?.data) ? pagesResponse.data : [];

    return {
      brand: navbar.brand ?? 'Vietpolyglots',
      logo: navbar.logo ?? null,
      fixedMenu: Array.isArray(navbar.fixedMenu) ? navbar.fixedMenu : [],
      dynamicMenu: mergeNavbarPages(navbar, pages),
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
