const { test, expect } = require('@playwright/test');

test.describe('/api/haro/mailbox/google/start', () => {
  test('rejects unauthenticated or wrong-method requests without starting OAuth', async ({
    request,
  }) => {
    expect((await request.get('/api/haro/mailbox/google/start')).status()).toBe(401);
    expect((await request.post('/api/haro/mailbox/google/start', { data: {} })).status()).toBe(405);
  });
});
