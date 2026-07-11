export type CspEnvironment = {
  isDevelopment?: boolean;
  isE2E?: boolean;
};

const CAL_ORIGIN = 'https://cal.vietpolyglots.com';

export function createNonce(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);

  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 32);
}

export function buildContentSecurityPolicy(
  nonce: string,
  { isDevelopment = false, isE2E = false }: CspEnvironment = {}
): string {
  const allowDevEval = isDevelopment || isE2E;

  return [
    "default-src 'self'",
    [
      "script-src 'self'",
      `'nonce-${nonce}'`,
      allowDevEval ? "'unsafe-eval'" : null,
      'https://www.googletagmanager.com',
      'https://accounts.google.com',
      'https://apis.google.com',
    ]
      .filter(Boolean)
      .join(' '),
    "style-src 'self' 'unsafe-inline' https://accounts.google.com",
    "img-src 'self' data: blob: https://strapi.vietpolyglots.com https://www.googletagmanager.com https://ssl.gstatic.com https://*.googleusercontent.com",
    "font-src 'self' data:",
    "connect-src 'self' https://strapi.vietpolyglots.com https://accounts.google.com https://www.googleapis.com https://oauth2.googleapis.com https://*.google.com",
    `frame-src 'self' https://accounts.google.com ${CAL_ORIGIN}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://accounts.google.com",
    "frame-ancestors 'none'",
    !isDevelopment ? 'upgrade-insecure-requests' : null,
  ]
    .filter(Boolean)
    .join('; ');
}
