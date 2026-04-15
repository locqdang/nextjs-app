/**
 * Verify Login Token API Route
 * GET /api/auth/verify-login?token=xxx
 *
 * Response: { success, token, user } or { error }
 */

import jwt from 'jsonwebtoken';
import { connectToMongoDB } from '../../../lib/data/mongodb';

const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    const db = await connectToMongoDB();
    const tokensCollection = db.collection('loginTokens');
    const usersCollection = db.collection('users');

    // Find token in database
    const loginToken = await tokensCollection.findOne({ token });

    if (!loginToken) {
      return res.status(401).json({ error: 'Invalid or expired login link' });
    }

    // Check if token has been used
    if (loginToken.used) {
      return res.status(401).json({ error: 'This login link has already been used' });
    }

    // Check if token has expired
    if (new Date() > new Date(loginToken.expiresAt)) {
      return res.status(401).json({ error: 'This login link has expired' });
    }

    // Get user
    const user = await usersCollection.findOne({ _id: loginToken.userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Mark token as used
    await tokensCollection.updateOne({ token }, { $set: { used: true, usedAt: new Date() } });

    // Create JWT token
    const jwtToken = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data and JWT
    res.status(200).json({
      success: true,
      token: jwtToken,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ error: 'Failed to verify login token' });
  }
}
