# Contract: Security Boundaries

## Rendering contract

- React text and normal attributes are the default safe rendering boundary.
- No new raw HTML rendering is allowed without a documented exception and tests.
- JSON-LD in `src/components/StructuredData.tsx` is the only current deliberate raw-script exception.

## URL contract

- All browser-facing navigation targets from untrusted sources must pass through `normalizeLinkUrl()`.
- Unsafe, malformed, protocol-relative, or script-like URLs must not produce clickable navigation.
- External links that survive validation must use `target="_blank"` and `rel="nofollow noopener noreferrer"` where appropriate.

## Redirect contract

- Post-login navigation targets must pass through `normalizeRedirectPath()`.
- Only same-origin relative paths are allowed.
- Invalid redirect values fall back to `/`.

## Session contract

- Browser auth is cookie-backed.
- Protected API routes authenticate with `readSession()`.
- LocalStorage, sessionStorage, and bearer-only fallback are not part of the hardened production path.
- Logout must clear the session cookie.

## Cache contract

- Authenticated HARO profile, pitches, mailbox, session, login verification, and logout responses must be non-cacheable.
- Minimum response headers: `Cache-Control: no-store, no-cache, must-revalidate` and `Pragma: no-cache`.

## CSP contract

- Production CSP is enforced from `next.config.mjs`.
- Production policy must avoid broad `unsafe-inline` and `unsafe-eval` allowances.
- Retained third-party origins are limited to the documented Google Identity, GTM, and Strapi dependencies.

## Logging contract

- API routes must log through `createApiLogger()` where request context matters.
- Error serialization must use `serializeError()`.
- Logs must not include raw cookies, OAuth codes, access tokens, refresh tokens, bearer tokens, or magic links.

## Documented exceptions

### JSON-LD

- **Why it exists**: search engines need a JSON-LD script block.
- **Risk control**: `sanitizeStructuredDataJson()` escapes script-breaking characters.
- **Coverage**: `src/components/StructuredData.test.tsx`, `src/tests/components/render-security.test.tsx`.

### Google scripts and frames

- **Why they exist**: Google Tag Manager and Google Identity are retained product dependencies.
- **Risk control**: explicit CSP allowlists only for the required Google origins.
- **Coverage**: `src/tests/next-config-security-headers.test.js`, Playwright auth verification.

### Development and E2E CSP relaxations

- **Why they exist**: local Next.js and test tooling still need temporary compatibility allowances.
- **Risk control**: gated by `NODE_ENV !== 'production'` or `E2E_TEST_MODE === '1'` in `next.config.mjs`.
- **Coverage**: header regression tests plus production-shape build verification.
