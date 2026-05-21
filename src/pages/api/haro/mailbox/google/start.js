import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

const JWT_SECRET = process.env.JWT_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL;
const GOOGLE_MAILBOX_CALLBACK_URL =
  process.env.GOOGLE_MAILBOX_CALLBACK_URL ||
  (FRONTEND_URL ? `${FRONTEND_URL.replace(/\/$/, '')}/api/haro/mailbox/google/callback` : '');

const GOOGLE_SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/gmail.send',
];

function getBearerToken(req) {
  const auth = req.headers.authorization || '';
  return auth.startsWith('Bearer ') ? auth.slice(7) : null;
}

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
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const token = getBearerToken(req);

    if (!token) {
      return res.status(401).json({ message: 'Missing token' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const email = normalizeEmail(decoded.email);

    if (!email) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    const oauthClient = getOAuthClient();

    if (!oauthClient) {
      return res.status(500).json({
        message: 'Google OAuth is not configured for mailbox connection.',
      });
    }

    const state = jwt.sign(
      {
        type: 'haro-mailbox-google',
        email,
      },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const url = oauthClient.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      include_granted_scopes: true,
      scope: GOOGLE_SCOPES,
      state,
    });

    return res.status(200).json({ url });
  } catch (error) {
    console.error('HARO mailbox Google start error:', error);
    return res.status(401).json({ message: 'Unauthorized' });
  }
}
