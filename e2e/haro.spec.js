const { test, expect } = require('@playwright/test');
const { signInWithMagicLink } = require('./helpers/route-auth');

test.describe('/haro', () => {
  test('redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/haro');

    await page.waitForURL('**/login?redirect=*');
    await expect(page).toHaveURL(/\/login\?redirect=%2Fharo$/);
  });

  test('loads for a signed-in test user', async ({ page, request }) => {
    await signInWithMagicLink(page, request, {
      email: 'e2e-haro-route@example.com',
      redirectPath: '/haro',
    });

    await expect(
      page.getByRole('heading', { name: 'Manage your HARO workflow from one place' })
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'View Pitches' })).toBeVisible();
  });
});
