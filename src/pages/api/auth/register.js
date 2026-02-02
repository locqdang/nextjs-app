/**
 * Register API Route
 * POST /api/auth/register
 * 
 * Body: { name, email, password, passwordConfirm }
 * Response: { success, user } or { error }
 */

import bcryptjs from 'bcryptjs';
import { findOne, insertOne } from '../../../lib/data/mongodb.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, password, passwordConfirm } = req.body;

  // Validate input
  if (!name || !email || !password || !passwordConfirm) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (password !== passwordConfirm) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    // Check if user already exists
    const existingUser = await findOne('users', { email: email.toLowerCase() });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create new user
    const result = await insertOne('users', {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: result.insertedId,
        name,
        email,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
