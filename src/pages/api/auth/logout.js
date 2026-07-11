import { clearSessionCookie } from '../../../lib/auth/session';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  clearSessionCookie(res);
  return res.status(200).json({ success: true });
}
