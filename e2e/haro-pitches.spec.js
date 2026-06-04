const { test, expect } = require('@playwright/test');
const { signInWithMagicLink } = require('./helpers/route-auth');

test.describe('/haro/pitches', () => {
  test('redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/haro/pitches');

    await page.waitForURL('**/login?redirect=*');
    await expect(page).toHaveURL(/\/login\?redirect=%2Fharo%2Fpitches$/);
  });

  test('loads for a signed-in test user without creating pitches', async ({ page, request }) => {
    await signInWithMagicLink(page, request, {
      email: 'e2e-haro-pitches-route@example.com',
      redirectPath: '/haro/pitches',
    });

    await expect(page.getByRole('heading', { name: 'Recent Pitches' })).toBeVisible();
    await expect(
      page.getByText(/No pitch has been done on your behalf|No pitches have been submitted/)
    ).toBeVisible();
  });
});
