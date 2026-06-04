const { test, expect } = require('@playwright/test');

test.describe('navbar Services dropdown', () => {
  test('Services submenu is collapsed by default and opens when clicked', async ({ page }) => {
    await page.goto('/');

    const servicesButton = page.getByRole('button', { name: 'Services' });
    const servicesDropdown = page.locator('.nav__dropdown').filter({ has: servicesButton });
    const haroLink = servicesDropdown.getByRole('link', { name: 'HARO' });

    await expect(servicesButton).toHaveAttribute('aria-expanded', 'false');
    await expect(haroLink).not.toBeVisible();

    await servicesButton.click();

    await expect(servicesButton).toHaveAttribute('aria-expanded', 'true');
    await expect(haroLink).toBeVisible();
  });
});
