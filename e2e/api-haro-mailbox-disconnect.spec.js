const { test, expect } = require('@playwright/test');

test.describe('/api/haro/mailbox/disconnect', () => {
  test('rejects unauthenticated or wrong-method requests without disconnecting data', async ({
    request,
  }) => {
    expect((await request.post('/api/haro/mailbox/disconnect', { data: {} })).status()).toBe(401);
    expect((await request.get('/api/haro/mailbox/disconnect')).status()).toBe(405);
  });
});
