const { test, expect } = require('@playwright/test');
const { signInWithMagicLink } = require('./helpers/route-auth');

test.describe('/haro/journalists', () => {
  test('redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/haro/journalists');

    await page.waitForURL('**/login?redirect=*');
    await expect(page).toHaveURL(/\/login\?redirect=%2Fharo%2Fjournalists$/);
  });

  test('loads the placeholder for a signed-in test user', async ({ page, request }) => {
    await signInWithMagicLink(page, request, {
      email: 'e2e-haro-journalists-route@example.com',
      redirectPath: '/haro/journalists',
    });

    await expect(page.getByRole('heading', { name: 'Journalists page is under construction' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Back to HARO' })).toBeVisible();
  });
});
