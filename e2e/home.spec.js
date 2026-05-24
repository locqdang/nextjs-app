const { test, expect } = require('@playwright/test');

test('home page loads', async ({ page }) => {
  // Verify base route is reachable and returns a successful HTTP response.
  const response = await page.goto('/');

  expect(response).not.toBeNull();
  expect(response.ok()).toBeTruthy();
  // Confirm page rendered enough to display the document body.
  await expect(page.locator('body')).toBeVisible();
});
