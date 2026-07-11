import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { createApiLogger } from '../../../../../lib/api-logging';
import { readSession } from '../../../../../lib/auth/session';
import { serializeError } from '../../../../../lib/logger';

const JWT_SECRET = process.env.JWT_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL;
const GOOGLE_MAILBOX_CALLBACK_URL =
  process.env.GOOGLE_MAILBOX_CALLBACK_URL ||
  (FRONTEND_URL ? `${FRONTEND_URL.replace(/\/$/, '')}/api/haro/mailbox/google/callback` : '');

const GOOGLE_SCOPES = ['openid', 'email', 'profile', 'https://www.googleapis.com/auth/gmail.send'];

function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

function getOAuthClient() {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_MAILBOX_CALLBACK_URL) {
    return null;
  }

  return new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_MAILBOX_CALLBACK_URL);
}

export default async function handler(req, res) {
  // Intent: attach route/operation context before auth succeeds, without logging the bearer token.
  const log = createApiLogger(req, {
    route: '/api/haro/mailbox/google/start',
    operation: 'haro_mailbox_google_start',
  });

  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = readSession(req);

    if (!session?.user?.email) {
      return res.status(401).json({ message: 'Missing token' });
    }

    const email = normalizeEmail(session.user.email);

    if (!email) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    const userLog = createApiLogger(req, {
      route: '/api/haro/mailbox/google/start',
      operation: 'haro_mailbox_google_start',
      userEmail: email,
    });

    const oauthClient = getOAuthClient();

    if (!oauthClient) {
      userLog.error('Google OAuth is not configured for mailbox connection');
      return res.status(500).json({
        message: 'Google OAuth is not configured for mailbox connection.',
      });
    }

    // Sign state so callback can verify this flow was initiated by our app for this user.
    const state = jwt.sign(
      {
        type: 'haro-mailbox-google',
        email,
      },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    // Build Google consent URL (scopes + state) for Authorization Code flow.
    const url = oauthClient.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      include_granted_scopes: true,
      scope: GOOGLE_SCOPES,
      state,
    });

    return res.status(200).json({ url });
  } catch (error) {
    log.error({ error: serializeError(error) }, 'HARO mailbox Google start error');
    return res.status(401).json({ message: 'Unauthorized' });
  }
}
