/**
 * Passport Middleware Helper for Next.js API Routes
 * Since Next.js doesn't use Express, we need to adapt Passport for API routes
 */

import passport from './passport.js';

/**
 * Initialize Passport for a Next.js API route
 */
export function initializePassport(req, res) {
  return new Promise((resolve, reject) => {
    passport.initialize()(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

/**
 * Authenticate using Passport strategy
 */
export function authenticatePassport(strategy, req, res) {
  return new Promise((resolve, reject) => {
    passport.authenticate(strategy, { session: false }, (err, user, info) => {
      if (err) {
        return reject(err);
      }

      if (!user) {
        return resolve({ success: false, message: info?.message || 'Authentication failed' });
      }

      resolve({ success: true, user });
    })(req, res);
  });
}

/**
 * Run Passport middleware in Next.js API route
 */
export async function runPassportAuth(req, res) {
  await initializePassport(req, res);
  return await authenticatePassport('local', req, res);
}
