const { test, expect } = require('@playwright/test');
const { createMagicLoginLink } = require('./helpers/auth');

test.describe('email magic-link login', () => {
  test('logs in from a generated magic link', async ({ page, request }) => {
    // Generate a real test-only magic link so this flow exercises verify-login end to end.
    const loginLink = await createMagicLoginLink(request, {
      email: 'e2e-login@example.com',
      redirectPath: '/',
    });

    await page.goto(loginLink);
    await page.waitForURL('http://127.0.0.1:3100/');
    await expect(page).toHaveURL(/\/$/);

    const token = await page.evaluate(() => window.localStorage.getItem('token'));
    const user = await page.evaluate(() => window.localStorage.getItem('user'));

    expect(token).toBeTruthy();
    expect(user).toContain('e2e-login@example.com');

    await page.getByRole('button', { name: 'Account' }).click();
    await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
  });

  test('returns to the intended protected page after login', async ({ page, request }) => {
    // Confirm guard redirects unauthenticated users and preserves intended destination.
    await page.goto('/haro');
    await page.waitForURL('**/login?redirect=*');

    const loginLink = await createMagicLoginLink(request, {
      email: 'e2e-redirect@example.com',
      redirectPath: '/haro',
    });

    await page.goto(loginLink);
    await page.waitForURL('**/haro');

    await expect(page).toHaveURL(/\/haro$/);
  });
});
