import { createMagicLoginLink } from '../../../lib/auth/createMagicLoginLink';

function isTestModeEnabled() {
  return process.env.NODE_ENV === 'test' || process.env.E2E_TEST_MODE === '1';
}

export default async function handler(req, res) {
  if (!isTestModeEnabled()) {
    return res.status(403).json({ error: 'Test login link generation is disabled' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, redirectPath = '/' } = req.body || {};

  try {
    const { loginLink } = await createMagicLoginLink({ email, redirectPath });

    return res.status(200).json({
      success: true,
      loginLink,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to generate login link' });
  }
}
