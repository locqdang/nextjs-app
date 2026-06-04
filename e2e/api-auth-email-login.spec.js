const { test, expect } = require('@playwright/test');

test.describe('/api/auth/email-login', () => {
  test('rejects invalid or wrong-method requests safely', async ({ request }) => {
    expect((await request.get('/api/auth/email-login')).status()).toBe(405);
    expect(
      (await request.post('/api/auth/email-login', { data: { email: 'not-an-email' } })).status()
    ).toBe(400);
  });
});
