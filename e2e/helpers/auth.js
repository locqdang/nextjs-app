async function createMagicLoginLink(request, { email, redirectPath = '/' }) {
  // Use test-only API to mint a valid magic link without depending on real email delivery.
  const response = await request.post('/api/test/generate-login-link', {
    data: { email, redirectPath },
  });

  if (!response.ok()) {
    throw new Error(
      `Failed to create magic login link: ${response.status()} ${await response.text()}`
    );
  }

  const data = await response.json();
  return data.loginLink;
}

module.exports = {
  createMagicLoginLink,
};
