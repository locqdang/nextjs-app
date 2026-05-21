import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { findOne, insertOne, updateOne } from '../../../../../lib/data/haro';

const JWT_SECRET = process.env.JWT_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL;
const GOOGLE_MAILBOX_CALLBACK_URL =
  process.env.GOOGLE_MAILBOX_CALLBACK_URL ||
  (FRONTEND_URL ? `${FRONTEND_URL.replace(/\/$/, '')}/api/haro/mailbox/google/callback` : '');
const PROFILE_URL = FRONTEND_URL
  ? `${FRONTEND_URL.replace(/\/$/, '')}/haro/profile`
  : '/haro/profile';
const ENCRYPTION_SECRET = process.env.MAILBOX_TOKEN_ENCRYPTION_KEY || process.env.JWT_SECRET || '';
const MAILBOX_COLLECTION = 'mailbox_connections';

function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

function getOAuthClient() {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_MAILBOX_CALLBACK_URL) {
    return null;
  }

  return new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_MAILBOX_CALLBACK_URL);
}

function buildRedirectUrl(status, message) {
  const url = new URL(PROFILE_URL, FRONTEND_URL || 'http://localhost');
  url.searchParams.set('mailbox', status);
  if (message) {
    url.searchParams.set('message', message);
  }
  return FRONTEND_URL ? url.toString() : `${url.pathname}${url.search}`;
}

function encryptValue(value) {
  if (!value) {
    return null;
  }

  const key = crypto.createHash('sha256').update(ENCRYPTION_SECRET).digest();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${iv.toString('base64')}:${tag.toString('base64')}:${encrypted.toString('base64')}`;
}

async function ensureProfileExists(email) {
  const existingProfile = await findOne('profiles', { expert_email: email });
  if (existingProfile) {
    return;
  }

  const now = new Date();
  await insertOne('profiles', {
    expert_email: email,
    expert_status: 'active',
    createdAt: now,
    updatedAt: now,
  });
}

async function persistMailboxConnection(ownerEmail, tokens, connectedEmail) {
  const now = new Date();
  const existingConnection = await findOne(MAILBOX_COLLECTION, {
    owner_email: ownerEmail,
    provider: 'google',
  });

  const mailboxUpdate = {
    owner_email: ownerEmail,
    provider: 'google',
    status: 'connected',
    connected_email: normalizeEmail(connectedEmail) || ownerEmail,
    connected_at: now,
    disconnected_at: null,
    access_token_enc: encryptValue(tokens.access_token || ''),
    refresh_token_enc: encryptValue(tokens.refresh_token || ''),
    token_scope: tokens.scope || '',
    token_type: tokens.token_type || '',
    expiry_date: tokens.expiry_date || null,
    updatedAt: now,
  };

  if (existingConnection) {
    await updateOne(
      MAILBOX_COLLECTION,
      { owner_email: ownerEmail, provider: 'google' },
      mailboxUpdate
    );
    return;
  }

  await insertOne(MAILBOX_COLLECTION, {
    ...mailboxUpdate,
    createdAt: now,
  });
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    if (!ENCRYPTION_SECRET) {
      throw new Error('Missing encryption secret');
    }

    const oauthClient = getOAuthClient();

    if (!oauthClient) {
      throw new Error('Google OAuth is not configured for mailbox connection.');
    }

    const code = typeof req.query.code === 'string' ? req.query.code : '';
    const state = typeof req.query.state === 'string' ? req.query.state : '';

    if (!code || !state) {
      return res.redirect(buildRedirectUrl('error', 'Missing Google OAuth callback parameters.'));
    }

    const decodedState = jwt.verify(state, JWT_SECRET);
    const ownerEmail = normalizeEmail(decodedState?.email);

    if (decodedState?.type !== 'haro-mailbox-google' || !ownerEmail) {
      return res.redirect(buildRedirectUrl('error', 'Invalid mailbox connection state.'));
    }

    const { tokens } = await oauthClient.getToken(code);
    oauthClient.setCredentials(tokens);

    const tokenInfo = await oauthClient.getTokenInfo(tokens.access_token);
    const connectedEmail = normalizeEmail(tokenInfo.email);

    if (!connectedEmail) {
      return res.redirect(
        buildRedirectUrl('error', 'Google did not return an email address for this mailbox.')
      );
    }

    await ensureProfileExists(ownerEmail);
    await persistMailboxConnection(ownerEmail, tokens, connectedEmail);

    return res.redirect(buildRedirectUrl('connected', 'Gmail mailbox connected successfully.'));
  } catch (error) {
    console.error('HARO mailbox Google callback error:', error);
    return res.redirect(buildRedirectUrl('error', 'Failed to connect Gmail mailbox.'));
  }
}
