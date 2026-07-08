import { connectToMongoDB } from '../../../lib/data/mongodb';
import { createApiLogger } from '../../../lib/api-logging';
import { serializeError } from '../../../lib/logger';
import { createSessionToken, setSessionCookie } from '../../../lib/auth/session';

export default async function handler(req, res) {
  const log = createApiLogger(req, {
    route: '/api/auth/verify-login',
    operation: 'auth_verify_login',
  });

  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');

  if (req.method !== 'POST') {
    log.warn({ method: req.method }, 'Invalid auth/verify-login method');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.body;

  if (!token) {
    log.warn({ reason: 'missing_token' }, 'Verify-login request missing token');
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    const db = await connectToMongoDB();
    const tokensCollection = db.collection('loginTokens');
    const usersCollection = db.collection('users');

    const loginToken = await tokensCollection.findOne({ token });

    if (!loginToken) {
      log.warn({ reason: 'invalid_or_expired_token' }, 'Verify-login token invalid or expired');
      return res.status(401).json({ error: 'Invalid or expired login link' });
    }

    if (loginToken.used) {
      log.warn({ reason: 'used_token' }, 'Verify-login token already used');
      return res.status(401).json({ error: 'This login link has already been used' });
    }

    if (new Date() > new Date(loginToken.expiresAt)) {
      log.warn({ reason: 'expired_token' }, 'Verify-login token expired');
      return res.status(401).json({ error: 'This login link has expired' });
    }

    const user = await usersCollection.findOne({ _id: loginToken.userId });

    if (!user) {
      log.warn({ userId: loginToken.userId?.toString() }, 'Verify-login user not found');
      return res.status(404).json({ error: 'User not found' });
    }

    await tokensCollection.updateOne({ token }, { $set: { used: true, usedAt: new Date() } });

    const sessionToken = createSessionToken(user);
    setSessionCookie(res, sessionToken);

    log.info({ userId: user._id?.toString() }, 'Verify-login token accepted');

    res.status(200).json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    log.error({ error: serializeError(error) }, 'Token verification error');
    res.status(500).json({ error: 'Failed to verify login token' });
  }
}
