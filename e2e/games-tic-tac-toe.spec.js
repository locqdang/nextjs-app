const { test, expect } = require('@playwright/test');

test.describe('/games/tic-tac-toe', () => {
  test('loads the tic-tac-toe game page successfully', async ({ page }) => {
    const response = await page.goto('/games/tic-tac-toe');

    expect(response).not.toBeNull();
    expect(response.ok()).toBeTruthy();
    await expect(page).toHaveURL(/\/games\/tic-tac-toe$/);
    await expect(page.getByRole('heading', { name: 'Tic-Tac-Toe' })).toBeVisible();
  });
});
