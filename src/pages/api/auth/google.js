/**
 * Google OAuth Callback Handler
 * POST /api/auth/google
 * 
 * Handles Google One Tap responses
 * Body: { credential } - JWT token from Google
 * Response: { success, token, user } or { error }
 */

import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { findOne, insertOne } from '../../../lib/data/mongodb.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET;

export default async function handleGoogleLogin(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ error: 'Credential is required' });
  }

  try {
    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Check if user exists
    let user = await findOne('users', { googleId });

    if (!user) {
      // Create new user
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

    // Create JWT token
    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remove password if exists
    const { password, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Google authentication error:', error);
    res.status(401).json({ error: 'Invalid credential' });
  }
}
