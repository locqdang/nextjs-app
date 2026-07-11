import { OAuth2Client } from 'google-auth-library';
import { findOne, insertOne } from '../../../lib/data/mongodb.js';
import { createApiLogger } from '../../../lib/api-logging';
import { serializeError } from '../../../lib/logger';
import { createSessionToken, setSessionCookie } from '../../../lib/auth/session';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export default async function handleGoogleLogin(req, res) {
  const log = createApiLogger(req, {
    route: '/api/auth/google',
    operation: 'auth_google',
  });

  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');

  if (req.method !== 'POST') {
    log.warn({ method: req.method }, 'Invalid auth/google method');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { credential } = req.body;

  if (!credential) {
    log.warn({ reason: 'missing_credential' }, 'Google auth request missing credential');
    return res.status(400).json({ error: 'Credential is required' });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    let user = await findOne('users', { googleId });

    if (!user) {
      const newUser = {
        googleId,
        email: email.toLowerCase(),
        name,
        picture: picture || null,
        createdAt: new Date(),
        provider: 'google',
      };

      const result = await insertOne('users', newUser);
      user = { ...newUser, _id: result.insertedId };
    }

    const sessionToken = createSessionToken(user);
    setSessionCookie(res, sessionToken);

    const { password, ...userWithoutPassword } = user;

    log.info({ userId: user._id?.toString() }, 'Google auth successful');

    res.status(200).json({
      success: true,
      user: userWithoutPassword,
    });
  } catch (error) {
    log.error({ error: serializeError(error) }, 'Google authentication error');
    res.status(401).json({ error: 'Invalid credential' });
  }
}
