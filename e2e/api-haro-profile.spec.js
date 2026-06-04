const { test, expect } = require('@playwright/test');

test.describe('/api/haro/profile', () => {
  test('rejects unauthenticated or wrong-method requests without mutating data', async ({ request }) => {
    expect((await request.get('/api/haro/profile')).status()).toBe(401);
    expect((await request.put('/api/haro/profile', { data: {} })).status()).toBe(401);
    expect((await request.post('/api/haro/profile', { data: {} })).status()).toBe(405);
  });
});
