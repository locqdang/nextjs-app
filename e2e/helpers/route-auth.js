const { createMagicLoginLink } = require('./auth');

async function signInWithMagicLink(page, request, { email, redirectPath = '/' }) {
  const loginLink = await createMagicLoginLink(request, { email, redirectPath });
  await page.goto(loginLink);
  await page.waitForURL(`**${redirectPath}`);
}

module.exports = {
  signInWithMagicLink,
};
