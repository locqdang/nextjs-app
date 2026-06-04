const { test, expect } = require('@playwright/test');

test.describe('/api/auth/verify-login', () => {
  test('rejects missing token and wrong method safely', async ({ request }) => {
    expect((await request.get('/api/auth/verify-login')).status()).toBe(405);
    expect((await request.post('/api/auth/verify-login', { data: {} })).status()).toBe(400);
  });
});
