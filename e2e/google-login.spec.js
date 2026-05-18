const { test, expect } = require('@playwright/test');
const { mockGoogleIdentity, getGoogleMockState } = require('./helpers/google');

test.describe('google one tap login', () => {
  test.beforeEach(async ({ page }) => {
    await mockGoogleIdentity(page);
  });

  test('shows the Google sign-in button on a direct /login visit', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
    await expect(page.getByTestId('mock-google-button')).toBeVisible();

    const googleState = await getGoogleMockState(page);
    expect(googleState.renderCalls).toHaveLength(1);
    expect(googleState.renderCalls[0].id).toBe('google-signin-button');
    expect(googleState.promptCalls).toBeGreaterThan(0);
  });

  test('shows the Google sign-in button after client navigation from home to /login', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Login' }).click();

    await page.waitForURL('**/login');
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
    await expect(page.getByTestId('mock-google-button')).toBeVisible();

    const googleState = await getGoogleMockState(page);
    expect(googleState.renderCalls.length).toBeGreaterThan(0);
  });

  test('redirects protected routes to login and still renders the Google button', async ({ page }) => {
    await page.goto('/haro');

    await page.waitForURL('**/login?redirect=*');
    await expect(page).toHaveURL(/\/login\?redirect=%2Fharo$/);
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
    await expect(page.getByTestId('mock-google-button')).toBeVisible();
  });

  test('uses the redirect query after a successful Google login', async ({ page }) => {
    await page.route('**/api/auth/google', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'google-token',
          user: {
            email: 'google-e2e@example.com',
            name: 'google-e2e',
          },
        }),
      });
    });

    await page.goto('/login?redirect=/haro');
    await expect(page.getByTestId('mock-google-button')).toBeVisible();

    await page.evaluate(async () => {
      await window.__googleMock.initializeConfig.callback({ credential: 'fake-credential' });
    });

    await page.waitForURL('**/haro');
    await expect(page).toHaveURL(/\/haro$/);

    const token = await page.evaluate(() => window.localStorage.getItem('token'));
    const user = await page.evaluate(() => window.localStorage.getItem('user'));

    expect(token).toBe('google-token');
    expect(user).toContain('google-e2e@example.com');
  });
});
