const { test, expect } = require('@playwright/test');
const { signInWithMagicLink } = require('./helpers/route-auth');

test.describe('/video-meeting', () => {
  test('redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/video-meeting');

    await page.waitForURL('**/login?redirect=*');
    await expect(page).toHaveURL(/\/login\?redirect=%2Fvideo-meeting$/);
  });

  test('loads the self-hosted Cal.com booking UI for a signed-in user', async ({
    page,
    request,
  }) => {
    const cspViolations = [];
    page.on('console', (message) => {
      const text = message.text();
      if (
        /content security policy|violates.*csp/i.test(text) &&
        /cal\.vietpolyglots\.com/i.test(text)
      ) {
        cspViolations.push(text);
      }
    });

    await signInWithMagicLink(page, request, {
      email: 'e2e-video-meeting-route@example.com',
      redirectPath: '/video-meeting',
    });

    await expect(page.getByRole('heading', { name: 'Book a Video Meeting' })).toBeVisible();

    const bookingFrame = page.locator('iframe[title="Book a video meeting"]');
    await expect(bookingFrame).toHaveAttribute('src', 'https://cal.vietpolyglots.com/loc/meet-loc');

    const cal = page.frameLocator('iframe[title="Book a video meeting"]');
    await expect(cal.getByText('Meet Loc', { exact: true })).toBeVisible({ timeout: 30_000 });
    await expect(cal.getByText('30m', { exact: true })).toBeVisible();
    await expect(cal.getByText(/\d{1,2}:\d{2}(?:am|pm)/i).first()).toBeVisible();
    expect(cspViolations).toEqual([]);
  });
});
