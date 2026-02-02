//  of how you should use your functions together
import bcrypt from 'bcryptjs';
import { findOne, insertOne } from '../data/mongodb.js';

export async function registerUser(userData) {
  // 1. Check if user exists
  const existingUser = await findOne('users', { email: userData.email });
  if (existingUser) throw new Error('User already exists');

  // 2. Hash the password
  const hashedPassword = await bcrypt.hash(userData.password, 12);

  // 3. Create the final document
  const newUser = {
    email: userData.email,
    password: hashedPassword,
    createdAt: new Date(),
    role: 'user'
  };

  // 4. Insert
  return await insertOne('users', newUser);
}