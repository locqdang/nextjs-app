/**
 * Email Login API Route (with Auto-Registration)
 * POST /api/auth/email-login
 * 
 * Body: { email }
 * Response: { success, message }
 */

import crypto from 'crypto';
import { connectToMongoDB } from '../../../lib/data/mongodb';

const N8N_WEBHOOK_URL = process.env.N8N_LOGIN_WEBHOOK_URL;
const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, redirectPath } = req.body;

  // Validate input
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email is required' });
  }

  try {
    const db = await connectToMongoDB();
    const usersCollection = db.collection('users');
    const tokensCollection = db.collection('loginTokens');

    const normalizedEmail = email.toLowerCase();

    // Check if user exists
    let user = await usersCollection.findOne({ email: normalizedEmail });

    // If user doesn't exist, create them
    if (!user) {
      const newUser = {
        email: normalizedEmail,
        name: normalizedEmail.split('@')[0], // Use email prefix
        createdAt: new Date(),
        updatedAt: new Date(),
        authMethod: 'email', // Mark as email-only auth
      };

      const result = await usersCollection.insertOne(newUser);
      user = { ...newUser, _id: result.insertedId };
      console.log(`✓ New user created: ${normalizedEmail}`);
    }

    // Generate secure random token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store token in database
    await tokensCollection.insertOne({
      token,
      email: user.email,
      userId: user._id,
      expiresAt,
      used: false,
      createdAt: new Date(),
    });

    // Create login link
    const loginLink = `${FRONTEND_URL}/verify-login?token=${token}&redirect=${redirectPath}`;

    // Call n8n webhook to send email
    if (N8N_WEBHOOK_URL) {
      try {
        await fetch(N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            name: user.name,
            loginLink,
            expiresIn: '15 minutes',
          }),
        });
      } catch (webhookError) {
        console.error('n8n webhook error:', webhookError);
        // Continue even if webhook fails - token is still created
      }
    } else {
      console.warn('N8N_LOGIN_WEBHOOK_URL not configured');
      // In development, log the link
      console.log(`\n🔗 Login link for ${email}:\n${loginLink}\n`);
    }

    res.status(200).json({
      success: true,
      message: 'Login link sent.',
    });
  } catch (error) {
    console.error('Email login error:', error);
    res.status(500).json({ error: 'Failed to process login request' });
  }
}