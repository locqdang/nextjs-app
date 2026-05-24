const { test, expect } = require('@playwright/test');

test.describe('/projects', () => {
  test('loads the projects page successfully', async ({ page }) => {
    // Direct-route smoke test for the projects page.
    const response = await page.goto('/projects');

    expect(response).not.toBeNull();
    expect(response.ok()).toBeTruthy();
    await expect(page).toHaveURL(/\/projects$/);
    // Validate core layout containers are present.
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('.grid')).toHaveCount(1);
  });

  test('can be opened from the navbar', async ({ page }) => {
    // Navigation-path test: user reaches /projects through header link.
    await page.goto('/');

    await page.getByRole('link', { name: 'Projects' }).first().click();

    await page.waitForURL('**/projects');
    await expect(page).toHaveURL(/\/projects$/);
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('.grid')).toHaveCount(1);
  });
});
