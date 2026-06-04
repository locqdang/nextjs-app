const { test, expect } = require('@playwright/test');
const { signInWithMagicLink } = require('./helpers/route-auth');

test.describe('/haro/profile', () => {
  test('redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/haro/profile');

    await page.waitForURL('**/login?redirect=*');
    await expect(page).toHaveURL(/\/login\?redirect=%2Fharo%2Fprofile$/);
  });

  test('loads for a signed-in test user', async ({ page, request }) => {
    await signInWithMagicLink(page, request, {
      email: 'e2e-haro-profile-route@example.com',
      redirectPath: '/haro/profile',
    });

    await expect(page.getByRole('heading', { name: 'Profile', exact: true })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /Email/ })).toBeVisible();
  });
});
