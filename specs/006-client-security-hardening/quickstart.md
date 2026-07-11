# Quickstart: Client-Side Security Hardening

## Final verification commands

Run from the repository root:

```bash
npm run lint
npm run test
npm run build
```

Targeted security slices that are especially relevant to this feature:

```bash
npx vitest run src/tests/lib/security.test.js src/tests/lib/auth-session.test.js src/tests/next-config-security-headers.test.js src/tests/api/security.integration.test.js src/tests/components/render-security.test.tsx src/tests/components/blog-detail-security.test.tsx
```

## Verify browser-safe content rendering

1. Run the targeted Vitest security slice above.
2. Confirm rich-text `javascript:` links render as inert text, not clickable anchors.
3. Confirm malicious-looking blog paragraph text such as `<script>alert(1)</script>` renders escaped in the blog-detail tests.
4. Confirm unsafe author profile links do not render a clickable public-profile anchor.
5. Confirm JSON-LD tests prove only one script tag is emitted and the payload contains escaped `</script>` sequences.

## Verify cookie-backed auth boundaries

1. Run `src/tests/lib/auth-session.test.js` and `src/tests/api/security.integration.test.js`.
2. Confirm bearer-only auth no longer creates a valid session.
3. Confirm `/api/auth/session` reads authenticated state from the signed cookie.
4. Confirm `/api/auth/logout` clears the session cookie with `HttpOnly`, explicit `SameSite`, and `Max-Age=0`.
5. Confirm HARO profile and pitches handlers reject requests with no cookie-backed session.

## Verify HARO API cache policy

1. Confirm the HARO profile and pitches integration tests pass.
2. Confirm responses include:
   - `Cache-Control: no-store, no-cache, must-revalidate`
   - `Pragma: no-cache`
3. Confirm mailbox OAuth routes, auth session introspection, and logout handlers set the same non-cacheable policy in code review and test output.

## Verify CSP and security headers

1. Run `src/tests/next-config-security-headers.test.js`.
2. Confirm the site-wide CSP includes only required Google and Strapi origins plus exact `https://cal.vietpolyglots.com` access in `frame-src`.
3. Confirm `Referrer-Policy`, `X-Content-Type-Options`, `X-Frame-Options`, and `Permissions-Policy` are present.
4. Confirm API routes inherit the global security headers and add non-cacheable response headers.
5. Sign in and open `/video-meeting`; confirm the iframe source is exactly `https://cal.vietpolyglots.com/loc/meet-loc`, booking availability loads, and no Cal.com-related CSP violation appears.
6. Add Cal.com to `script-src`, `connect-src`, `img-src`, `style-src`, or `font-src` only for resource classes directly requested by the parent page and proven necessary through production-browser evidence.
7. If framing is refused, inspect Cal.com's own `Content-Security-Policy: frame-ancestors` and `X-Frame-Options`; fix the self-hosted Cal.com response because the parent nonce cannot override it.
8. For Google compatibility, confirm the production header shape retains:
   - GTM script source
   - Google Identity script, frame, connect, and form-action sources

## Optional focused Playwright verification

If browser automation is available in the environment:

```bash
npm run test:e2e
```

Confirm at minimum:

1. Login and verify-login still complete.
2. Google sign-in flow still respects same-origin redirect normalization.
3. No auth token is written to `localStorage` or `sessionStorage`.
4. Representative public routes still load with the hardened CSP.

## Coverage map for SC-007 contexts

- **Text context**: `src/tests/components/blog-detail-security.test.tsx`, `src/tests/components/render-security.test.tsx`
- **URL attribute context**: `src/components/ParagraphRichText.test.tsx`, `src/components/link-safety.test.tsx`
- **Script / JSON-LD context**: `src/components/StructuredData.test.tsx`, `src/tests/components/render-security.test.tsx`
- **Redirect destination context**: `src/tests/lib/security.test.js`
- **Authenticated API response context**: `src/tests/api/security.integration.test.js`
- **Security headers context**: `src/tests/next-config-security-headers.test.js`

## Expected outcomes

- All commands above pass.
- No security test depends on browser-readable auth tokens.
- Unsafe URLs fail closed.
- JSON-LD remains inert.
- HARO authenticated responses remain non-cacheable.
- The feature folder contains current research, data model, contract, and verification notes that match the live code.

## Recorded verification outcomes

Verified on 2026-07-07 from the repository root.

### Commands run

```bash
npm run lint
npm run test
npm run build
npm run test -- src/tests/api/security.integration.test.js
```

### Outcomes

- `npm run lint`: passed, with two existing test-only warnings about mocked `<img>` usage in `src/components/link-safety.test.tsx` and `src/tests/components/blog-detail-security.test.tsx`
- `npm run test`: passed, 13 files and 50 tests green
- `npm run build`: passed, production build completed successfully
- `npm run test -- src/tests/api/security.integration.test.js`: passed, 5 targeted API security integration tests green

### Verified feature assertions

- Cookie-backed auth is the canonical browser session path
- Bearer-only fallback is not accepted by the auth-session helpers
- HARO profile and pitches APIs reject missing cookie-backed sessions
- HARO profile and pitches responses remain non-cacheable
- Blog-detail rendering keeps malicious text and unsafe links inert
- JSON-LD output remains a single inert script block
- Global CSP and related browser security headers remain present in the build-tested config

### Nonce CSP and Cal.com verification, 2026-07-11

- `npm test`: passed, 14 files and 53 tests green after nonce CSP implementation.
- `npm run build`: passed with the middleware/proxy route recognized and 25/25 pages generated.
- Two production HTTP requests received distinct 32-character nonces; all 26 nonce-bearing scripts in each response matched that response's CSP nonce.
- Production `script-src` contains neither `unsafe-inline` nor `unsafe-eval`.
- Browser verification confirmed React hydration, GTM loading, Google Identity script loading, and Google Identity stylesheet loading after allowing exact `https://accounts.google.com` access in `style-src`.
- `curl -I https://cal.vietpolyglots.com/loc/meet-loc` returned HTTP 200 with no conflicting `X-Frame-Options` or `frame-ancestors` response restriction.
- `npm run test:e2e -- e2e/video-meeting.spec.js`: passed 2/2. The authenticated flow verified the exact Cal.com iframe URL, visible `Meet Loc` and `30m` booking UI, visible appointment times, and no Cal.com-related CSP console errors.
- Google Identity cannot complete sign-in on `127.0.0.1` because that localhost origin is not authorized for the production OAuth client; this is an OAuth origin restriction, not a CSP violation.
- The Cal.com deployment emitted an unrelated Google Analytics certificate error while loaded directly; its booking calendar and availability still rendered.
