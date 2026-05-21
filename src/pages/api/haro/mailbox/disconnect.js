import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { findOne, updateOne } from '../../../../lib/data/haro';

const JWT_SECRET = process.env.JWT_SECRET;
const ENCRYPTION_SECRET = process.env.MAILBOX_TOKEN_ENCRYPTION_KEY || process.env.JWT_SECRET || '';
const MAILBOX_COLLECTION = 'mailbox_connections';

function getBearerToken(req) {
  const auth = req.headers.authorization || '';
  return auth.startsWith('Bearer ') ? auth.slice(7) : null;
}

function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

function decryptValue(value) {
  if (!value || !ENCRYPTION_SECRET) {
    return null;
  }

  try {
    const [ivB64, tagB64, encryptedB64] = value.split(':');
    if (!ivB64 || !tagB64 || !encryptedB64) {
      return null;
    }

    const key = crypto.createHash('sha256').update(ENCRYPTION_SECRET).digest();
    const iv = Buffer.from(ivB64, 'base64');
    const tag = Buffer.from(tagB64, 'base64');
    const encrypted = Buffer.from(encryptedB64, 'base64');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
  } catch (error) {
    console.error('Failed to decrypt mailbox token:', error);
    return null;
  }
}

async function revokeGoogleToken(token) {
  if (!token) {
    return;
  }

  const client = new OAuth2Client();
  try {
    await client.revokeToken(token);
  } catch (error) {
    console.error('Failed to revoke Google token:', error);
  }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');

  if (req.method !== 'POST') {
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

    const connection = await findOne(MAILBOX_COLLECTION, {
      owner_email: email,
      provider: 'google',
    });

    if (!connection) {
      return res.status(404).json({ message: 'Mailbox connection not found.' });
    }

    const accessToken = decryptValue(connection.access_token_enc);
    const refreshToken = decryptValue(connection.refresh_token_enc);

    await revokeGoogleToken(refreshToken || accessToken);

    await updateOne(
      MAILBOX_COLLECTION,
      { owner_email: email, provider: 'google' },
      {
        owner_email: email,
        provider: 'google',
        status: 'disconnected',
        connected_email: null,
        connected_at: null,
        disconnected_at: new Date(),
        access_token_enc: null,
        refresh_token_enc: null,
        token_scope: null,
        token_type: null,
        expiry_date: null,
        updatedAt: new Date(),
      }
    );

    return res.status(200).json({
      message: 'Mailbox disconnected successfully.',
      mailbox: { status: 'disconnected' },
    });
  } catch (error) {
    console.error('HARO mailbox disconnect error:', error);
    return res.status(401).json({ message: 'Unauthorized' });
  }
}
