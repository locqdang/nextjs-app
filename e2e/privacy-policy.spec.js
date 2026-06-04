const { test, expect } = require('@playwright/test');

test.describe('/privacy-policy', () => {
  test('loads the privacy policy page successfully', async ({ page }) => {
    const response = await page.goto('/privacy-policy');

    expect(response).not.toBeNull();
    expect(response.ok()).toBeTruthy();
    await expect(page).toHaveURL(/\/privacy-policy$/);
    await expect(page.getByRole('heading', { name: 'Privacy Policy' })).toBeVisible();
  });
});
