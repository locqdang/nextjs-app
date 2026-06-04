const { test, expect } = require('@playwright/test');

test.describe('/api/test/generate-login-link', () => {
  test('is available in E2E mode but validates input', async ({ request }) => {
    expect((await request.get('/api/test/generate-login-link')).status()).toBe(405);

    const invalidResponse = await request.post('/api/test/generate-login-link', { data: {} });
    expect(invalidResponse.status()).toBe(400);
  });
});
