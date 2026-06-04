const { test, expect } = require('@playwright/test');

test.describe('/api/auth/google', () => {
  test('rejects missing credential and wrong method safely', async ({ request }) => {
    expect((await request.get('/api/auth/google')).status()).toBe(405);
    expect((await request.post('/api/auth/google', { data: {} })).status()).toBe(400);
  });
});
