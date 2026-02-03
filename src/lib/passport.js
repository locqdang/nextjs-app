/**
 * Passport Configuration
 * Sets up Passport with Local Strategy and Google OAuth Strategy for authentication
 */

import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import bcryptjs from 'bcryptjs';
import { findOne, insertOne } from './data/mongodb.js';

// Configure Local Strategy
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        // Find user in database
        const user = await findOne('users', { email: email.toLowerCase() });

        if (!user) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        // Verify password
        const passwordMatch = await bcryptjs.compare(password, user.password);

        if (!passwordMatch) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        // Return user without password
        const { password: _, ...userWithoutPassword } = user;
        return done(null, userWithoutPassword);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id.toString());
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await findOne('users', { _id: id });
    if (!user) {
      return done(null, false);
    }
    const { password: _, ...userWithoutPassword } = user;
    done(null, userWithoutPassword);
  } catch (error) {
    done(error);
  }
});

// Configure Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists
        let user = await findOne('users', { googleId: profile.id });

        if (user) {
          // Update existing user
          const { password: _, ...userWithoutPassword } = user;
          return done(null, userWithoutPassword);
        }

        // Create new user if doesn't exist
        const newUser = {
          googleId: profile.id,
          email: profile.emails[0].value.toLowerCase(),
          name: profile.displayName,
          picture: profile.photos[0]?.value || null,
          createdAt: new Date(),
          provider: 'google',
        };

        const result = await insertOne('users', newUser);
        const { password: _, ...userWithoutPassword } = { ...newUser, _id: result.insertedId };
        return done(null, userWithoutPassword);
      } catch (error) {
        return done(error);
      }
    }
  )
);

export default passport;
