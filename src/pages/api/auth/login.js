/**
 * Login API Route with Passport
 * POST /api/auth/login
 * 
 * Body: { email, password }
 * Response: { success, token, user } or { error }
 */

import jwt from 'jsonwebtoken';
import { runPassportAuth } from '../../../lib/passportMiddleware.js';

const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Authenticate using Passport
    const authResult = await runPassportAuth(req, res);

    if (!authResult.success) {
      return res.status(401).json({ error: authResult.message });
    }

    const user = authResult.user;

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

    res.status(200).json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
