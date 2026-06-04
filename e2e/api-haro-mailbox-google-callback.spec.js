const { test, expect } = require('@playwright/test');

test.describe('/api/haro/mailbox/google/callback', () => {
  test('rejects wrong method and redirects missing params safely', async ({ request }) => {
    const wrongMethodResponse = await request.post('/api/haro/mailbox/google/callback', {
      data: {},
    });
    expect(wrongMethodResponse.status()).toBe(405);

    const missingParamsResponse = await request.get('/api/haro/mailbox/google/callback', {
      maxRedirects: 0,
    });
    expect([307, 308]).toContain(missingParamsResponse.status());
    expect(missingParamsResponse.headers().location).toContain('/haro/profile?mailbox=error');
  });
});
