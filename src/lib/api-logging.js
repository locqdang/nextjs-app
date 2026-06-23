// API logging helpers for adding safe request context to server-side logs.
// Keeps route, operation, request ID, and hashed user identity consistent without logging raw emails.

import crypto from 'crypto';
import { hashUserIdentity, logger } from './logger';

export function getRequestId(req) {
  const header = req?.headers?.['x-request-id'];

  if (Array.isArray(header)) {
    return header[0];
  }

  return header || crypto.randomUUID();
}

export function createApiLogger(req, { route, operation, userEmail } = {}) {
  const requestId = getRequestId(req);
  const userHash = hashUserIdentity(userEmail);

  return logger.child({
    route,
    operation,
    method: req?.method,
    requestId,
    ...(userHash ? { userHash } : {}),
  });
}
