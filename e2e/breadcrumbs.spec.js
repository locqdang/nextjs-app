const { test, expect } = require('@playwright/test');
const { signInWithMagicLink } = require('./helpers/route-auth');

function labelFromSegment(segment) {
  return decodeURIComponent(segment).replaceAll('-', ' ').toUpperCase();
}

function expectedBreadcrumbsFromPath(path) {
  const parts = path.split('/').filter(Boolean);

  return [
    { label: 'HOME', href: '/' },
    ...parts.map((part, index) => ({
      label: labelFromSegment(part),
      href: '/' + parts.slice(0, index + 1).join('/'),
    })),
  ];
}

test.describe('breadcrumbs', () => {
  const pathsToCheck = ['/account', '/account/profile', '/projects', '/blog'];
  const protectedPaths = [
    '/haro',
    '/haro/profile',
    '/haro/pitches',
    '/haro/journalists',
    '/video-meeting',
  ];

  for (const path of pathsToCheck) {
    test(`renders correct breadcrumbs for ${path}`, async ({ page }) => {
      await page.goto(path);

      const breadcrumbs = page.getByRole('navigation', { name: 'Breadcrumb' });
      const expectedItems = expectedBreadcrumbsFromPath(path);

      await expect(breadcrumbs).toBeVisible();

      for (let i = 0; i < expectedItems.length; i++) {
        const item = expectedItems[i];
        const isLast = i === expectedItems.length - 1;

        if (isLast) {
          await expect(breadcrumbs.getByText(item.label)).toBeVisible();
        } else {
          await expect(breadcrumbs.getByRole('link', { name: item.label })).toHaveAttribute(
            'href',
            item.href
          );
        }
      }
    });
  }

  for (const path of protectedPaths) {
    test(`redirects protected route ${path} to login`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/login/);
      const breadcrumbs = page.getByRole('navigation', { name: 'Breadcrumb' });
      await expect(breadcrumbs).toBeVisible();
      await expect(breadcrumbs.getByRole('link', { name: 'HOME' })).toHaveAttribute('href', '/');
      await expect(breadcrumbs.getByText('LOGIN')).toBeVisible();
    });
  }

  for (const path of protectedPaths) {
    test(`renders breadcrumbs for signed-in user on ${path}`, async ({ page, request }) => {
      await signInWithMagicLink(page, request, {
        email: 'e2e-breadcrumbs@example.com',
        redirectPath: path,
      });

      const breadcrumbs = page.getByRole('navigation', { name: 'Breadcrumb' });
      const expectedItems = expectedBreadcrumbsFromPath(path);

      await expect(breadcrumbs).toBeVisible();

      for (let i = 0; i < expectedItems.length; i++) {
        const item = expectedItems[i];
        const isLast = i === expectedItems.length - 1;

        if (isLast) {
          await expect(breadcrumbs.getByText(item.label)).toBeVisible();
        } else {
          await expect(breadcrumbs.getByRole('link', { name: item.label })).toHaveAttribute(
            'href',
            item.href
          );
        }
      }
    });
  }

  test('does not show breadcrumbs on homepage', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toHaveCount(0);
  });
});
