import { readSession } from '../../../lib/auth/session';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = readSession(req);

  if (!session) {
    return res.status(200).json({ authenticated: false, user: null });
  }

  return res.status(200).json({ authenticated: true, user: session.user });
}
