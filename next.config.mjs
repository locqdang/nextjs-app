/** @type {import('next').NextConfig} */
// Intent: App Router hydration still emits inline bootstrap scripts. Until this repo moves
// to a nonce-based CSP via middleware, production must allow inline scripts or pages can
// render as blank shells because the browser blocks Next's bootstrap.
const allowInlineScripts = true;
const allowDevEval = process.env.NODE_ENV !== 'production' || process.env.E2E_TEST_MODE === '1';
const enableUpgradeInsecureRequests = process.env.NODE_ENV === 'production';

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      [
        "script-src 'self'",
        allowInlineScripts ? "'unsafe-inline'" : null,
        allowDevEval ? "'unsafe-eval'" : null,
        'https://www.googletagmanager.com',
        'https://accounts.google.com',
        'https://apis.google.com',
      ]
        .filter(Boolean)
        .join(' '),
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://strapi.vietpolyglots.com https://www.googletagmanager.com https://ssl.gstatic.com https://*.googleusercontent.com",
      "font-src 'self' data:",
      "connect-src 'self' https://strapi.vietpolyglots.com https://accounts.google.com https://www.googleapis.com https://oauth2.googleapis.com https://*.google.com",
      "frame-src 'self' https://accounts.google.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self' https://accounts.google.com",
      "frame-ancestors 'none'",
      enableUpgradeInsecureRequests ? 'upgrade-insecure-requests' : null,
    ]
      .filter(Boolean)
      .join('; '),
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
];

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'strapi.vietpolyglots.com',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        source: '/api/:path*',
        headers: [
          ...securityHeaders,
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
