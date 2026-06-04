const { test, expect } = require('@playwright/test');

test.describe('/api/data', () => {
  test('supports GET and rejects other methods', async ({ request }) => {
    const getResponse = await request.get('/api/data');
    expect(getResponse.status()).toBe(200);
    await expect(getResponse).toBeOK();
    expect((await getResponse.json()).success).toBe(true);

    const postResponse = await request.post('/api/data', { data: {} });
    expect(postResponse.status()).toBe(405);
  });
});
