const { test, expect } = require('@playwright/test');
const { mockGoogleIdentity, getGoogleMockState } = require('./helpers/google');

test.describe('google one tap login', () => {
  test.beforeEach(async ({ page }) => {
    // Stub Google Identity script so tests stay deterministic and offline-safe.
    await mockGoogleIdentity(page);
  });

  test('shows the Google sign-in button on a direct /login visit', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
    await expect(page.getByTestId('mock-google-button')).toBeVisible();

    const googleState = await getGoogleMockState(page);
    expect(googleState.initializeCalled).toBe(true);
    expect(googleState.hasCallback).toBe(true);
    expect(googleState.initializeConfig).toBeTruthy();
    expect(googleState.renderCalls).toHaveLength(1);
    expect(googleState.renderCalls[0].id).toBe('google-signin-button');
    expect(googleState.promptCalls).toBeGreaterThan(0);
  });

  test('shows the Google sign-in button after client navigation from home to /login', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Account' }).click();
    await page.getByRole('link', { name: 'Login' }).click();

    await page.waitForURL('**/login');
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
    await expect(page.getByTestId('mock-google-button')).toBeVisible();

    const googleState = await getGoogleMockState(page);
    expect(googleState.renderCalls.length).toBeGreaterThan(0);
  });

  test('redirects protected routes to login and still renders the Google button', async ({
    page,
  }) => {
    await page.goto('/haro');

    await page.waitForURL('**/login?redirect=*');
    await expect(page).toHaveURL(/\/login\?redirect=%2Fharo$/);
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
    await expect(page.getByTestId('mock-google-button')).toBeVisible();
  });

  test('uses the redirect query after a successful Google login', async ({ page }) => {
    // Mock backend auth endpoint so we can validate client-side redirect/session behavior only.
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

    // Trigger the mocked Google callback to simulate a successful One Tap credential response.
    await page.evaluate(async () => {
      await window.__googleMock.callback({ credential: 'fake-credential' });
    });

    await page.waitForURL('**/haro');
    await expect(page).toHaveURL(/\/haro$/);
    await expect(
      page.getByRole('heading', { name: 'Manage your HARO workflow from one place' })
    ).toBeVisible();

    await page.getByRole('button', { name: 'Account' }).click();
    await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
  });
});
