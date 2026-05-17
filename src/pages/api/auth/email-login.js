/**
 * Email Login API Route (with Auto-Registration)
 * POST /api/auth/email-login
 *
 * Body: { email }
 * Response: { success, message }
 */

import { createMagicLoginLink } from '../../../lib/auth/createMagicLoginLink';

const N8N_WEBHOOK_URL = process.env.N8N_LOGIN_WEBHOOK_URL;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, redirectPath } = req.body;

  // Validate input
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email is required' });
  }

  try {
    const { loginLink, user } = await createMagicLoginLink({ email, redirectPath });

    // Call n8n webhook to send email
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
      } catch (webhookError) {
        console.error('n8n webhook error:', webhookError);
        // Continue even if webhook fails - token is still created
      }
    } else {
      console.warn('N8N_LOGIN_WEBHOOK_URL not configured');
      // In development, log the link
      console.log(`\n🔗 Login link for ${email}:\n${loginLink}\n`);
    }

    res.status(200).json({
      success: true,
      message: 'Login link sent.',
    });
  } catch (error) {
    console.error('Email login error:', error);
    res.status(500).json({ error: 'Failed to process login request' });
  }
}
