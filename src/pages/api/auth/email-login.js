import { createMagicLoginLink } from '../../../lib/auth/createMagicLoginLink';
import { createApiLogger } from '../../../lib/api-logging';
import { canLogLoginLinks, serializeError } from '../../../lib/logger';
import { normalizeRedirectPath } from '../../../lib/security';

const N8N_WEBHOOK_URL = process.env.N8N_LOGIN_WEBHOOK_URL;

export default async function handler(req, res) {
  const log = createApiLogger(req, {
    route: '/api/auth/email-login',
    operation: 'email_login',
  });

  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, redirectPath } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email is required' });
  }

  try {
    const safeRedirectPath = normalizeRedirectPath(redirectPath);
    const { loginLink, user } = await createMagicLoginLink({ email, redirectPath: safeRedirectPath });

    const userLog = createApiLogger(req, {
      route: '/api/auth/email-login',
      operation: 'email_login',
      userEmail: user.email,
    });

    if (N8N_WEBHOOK_URL) {
      try {
        await fetch(N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            name: user.name,
            loginLink,
            expiresIn: '15 minutes',
          }),
        });
        log.info({ result: 'login_link_sent' }, 'Email login requested');
      } catch (webhookError) {
        userLog.error({ error: serializeError(webhookError) }, 'n8n login webhook failed');
      }
    } else if (canLogLoginLinks()) {
      userLog.warn(
        { loginLink },
        'Development login link generated because n8n webhook is unavailable'
      );
    } else {
      userLog.warn('N8N login webhook is unavailable; login link suppressed');
    }

    res.status(200).json({
      success: true,
      message: 'Login link sent.',
    });
  } catch (error) {
    log.error({ error: serializeError(error) }, 'Email login error');
    res.status(500).json({ error: 'Failed to process login request' });
  }
}
