const { test, expect } = require('@playwright/test');

test.describe('/api/haro/pitches', () => {
  test('rejects unauthenticated or wrong-method requests without mutating data', async ({
    request,
  }) => {
    expect((await request.get('/api/haro/pitches')).status()).toBe(401);
    expect((await request.post('/api/haro/pitches', { data: {} })).status()).toBe(405);
  });
});
