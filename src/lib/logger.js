import crypto from 'crypto';
import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

const SENSITIVE_KEY_PATTERN = /token|auth|authorization|password|secret|credential|jwt|loginlink/i;

export function shouldIncludeStack() {
  return process.env.LOG_INCLUDE_STACK !== '0';
}

export function serializeError(error) {
  if (!error) {
    return undefined;
  }

  return {
    name: error.name,
    message: error.message || String(error),
    code: error.code,
    status: error.status || error.statusCode,
    stack: shouldIncludeStack() ? error.stack : undefined,
  };
}

export function redactLogFields(value) {
  if (Array.isArray(value)) {
    return value.map(redactLogFields);
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      SENSITIVE_KEY_PATTERN.test(key) ? '[Redacted]' : redactLogFields(item),
    ])
  );
}

export function hashUserIdentity(email) {
  const salt = process.env.LOG_HASH_SALT;

  if (!email || !salt) {
    return undefined;
  }

  return crypto
    .createHmac('sha256', salt)
    .update(String(email).trim().toLowerCase())
    .digest('hex')
    .slice(0, 24);
}

export function canLogLoginLinks() {
  return process.env.NODE_ENV !== 'production' && process.env.LOG_LOGIN_LINKS === '1';
}

export const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  base: {
    app: 'vietpolyglots',
    environment: process.env.NODE_ENV || 'development',
  },
  serializers: {
    err: serializeError,
    error: serializeError,
  },
});
