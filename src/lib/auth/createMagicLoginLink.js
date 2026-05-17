import crypto from 'crypto';
import { connectToMongoDB } from '../data/mongodb';

const DEFAULT_FRONTEND_URL = 'http://127.0.0.1:3100';

function normalizeFrontendUrl() {
  return (process.env.NEXT_PUBLIC_FRONTEND_URL || DEFAULT_FRONTEND_URL).replace(/\/$/, '');
}

export async function createMagicLoginLink({ email, redirectPath = '/' }) {
  if (!email || !email.includes('@')) {
    throw new Error('Valid email is required');
  }

  const db = await connectToMongoDB();
  const usersCollection = db.collection('users');
  const tokensCollection = db.collection('loginTokens');

  const normalizedEmail = email.toLowerCase();

  let user = await usersCollection.findOne({ email: normalizedEmail });

  if (!user) {
    const newUser = {
      email: normalizedEmail,
      name: normalizedEmail.split('@')[0],
      createdAt: new Date(),
      updatedAt: new Date(),
      authMethod: 'email',
    };

    const result = await usersCollection.insertOne(newUser);
    user = { ...newUser, _id: result.insertedId };
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await tokensCollection.insertOne({
    token,
    email: user.email,
    userId: user._id,
    expiresAt,
    used: false,
    createdAt: new Date(),
  });

  const loginUrl = new URL('/verify-login', normalizeFrontendUrl());
  loginUrl.searchParams.set('token', token);
  if (redirectPath) {
    loginUrl.searchParams.set('redirect', redirectPath);
  }

  return {
    loginLink: loginUrl.toString(),
    token,
    user,
    expiresAt,
  };
}
