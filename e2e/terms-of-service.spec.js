const { test, expect } = require('@playwright/test');

test.describe('/terms-of-service', () => {
  test('loads the terms of service page successfully', async ({ page }) => {
    const response = await page.goto('/terms-of-service');

    expect(response).not.toBeNull();
    expect(response.ok()).toBeTruthy();
    await expect(page).toHaveURL(/\/terms-of-service$/);
    await expect(page.getByRole('heading', { name: 'Terms of Service' })).toBeVisible();
  });
});
