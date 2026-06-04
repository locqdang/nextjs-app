const { test, expect } = require('@playwright/test');
const { signInWithMagicLink } = require('./helpers/route-auth');

test.describe('/video-meeting', () => {
  test('redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/video-meeting');

    await page.waitForURL('**/login?redirect=*');
    await expect(page).toHaveURL(/\/login\?redirect=%2Fvideo-meeting$/);
  });

  test('loads for a signed-in test user', async ({ page, request }) => {
    await signInWithMagicLink(page, request, {
      email: 'e2e-video-meeting-route@example.com',
      redirectPath: '/video-meeting',
    });

    await expect(page.getByRole('heading', { name: 'Book a Video Meeting' })).toBeVisible();
  });
});
