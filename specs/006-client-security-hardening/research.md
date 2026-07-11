# Research: Client-Side Security Hardening

## Decision: Keep `src/lib/security.js` as the single browser-facing normalization layer

**Rationale**: Link, redirect, and JSON-LD safety are easier to reason about and test when every component routes through one helper module instead of hand-rolling per-component checks.

## Decision: Keep React text and attribute rendering as the default control

**Rationale**: The safest path in this codebase is to let React escape plain text. Only URL attributes, redirect destinations, and the JSON-LD script block need special handling.

## Decision: Fail closed on unsafe link and redirect input

**Rationale**: `javascript:`, `data:`, protocol-relative, malformed, and backslash-shaped values should never be preserved for convenience. Unsafe values become inert text, `null`, or `/`.

## Decision: Keep JSON-LD as the only deliberate raw-script exception

**Rationale**: SEO structured data still needs a script tag, but `sanitizeStructuredDataJson()` now escapes `<`, `>`, `&`, `\u2028`, and `\u2029` so attacker-controlled strings cannot break out of the JSON-LD block.

## Decision: Use cookie-backed sessions only, remove bearer fallback

**Rationale**: The main blast-radius reduction comes from removing script-readable auth tokens. `readSession()` now authenticates only from the signed HttpOnly cookie, and the auth-session tests explicitly reject bearer-only requests.

## Decision: Keep session cookies `HttpOnly`, `Path=/`, explicit `SameSite`, expiry-bound, and `Secure` in production

**Rationale**: These attributes protect against straightforward JavaScript token theft, clarify browser behavior, and preserve same-site app navigation while allowing a documented `SameSite=None` override only when paired with `Secure`.

## Decision: Keep CSP header-based, with dev and E2E allowances only outside production

**Rationale**: The current app shell uses `next/script` for GTM and Google Identity instead of inline bootstrap code, so a header-based CSP remains practical. `unsafe-inline` and `unsafe-eval` are allowed only for development or E2E compatibility, not for production.

## Decision: Keep authenticated HARO and auth routes non-cacheable

**Rationale**: Profile data, pitches, mailbox connection state, session introspection, login completion, and logout responses should never be stored in browser or intermediary shared caches.

## Decision: Use structured API logging with hashed user identity and redacted secret-like fields

**Rationale**: Server logs need route and request context for debugging, but must not expose cookies, OAuth codes, tokens, magic links, or raw mailbox secrets. The mailbox disconnect route was updated to use `createApiLogger()` plus `serializeError()` instead of raw `console.error`.

## CSP compatibility notes

### Required retained sources

- `script-src`: `https://www.googletagmanager.com`, `https://accounts.google.com`, `https://apis.google.com`
- `img-src`: `https://strapi.vietpolyglots.com`, `https://www.googletagmanager.com`, `https://ssl.gstatic.com`, `https://*.googleusercontent.com`
- `connect-src`: `https://strapi.vietpolyglots.com`, `https://accounts.google.com`, `https://www.googleapis.com`, `https://oauth2.googleapis.com`, `https://*.google.com`
- `frame-src`: `https://accounts.google.com`
- `form-action`: `https://accounts.google.com`

### Current enforcement strategy

- Production: enforce CSP without `unsafe-inline` or `unsafe-eval`
- Development and E2E: allow temporary `unsafe-inline` and `unsafe-eval` to avoid blocking local Next.js tooling and test harness behavior
- Report-only mode: not currently needed because the app shell now avoids inline custom script blocks and the focused browser verification already passes with the enforced production policy shape

## Remaining accepted limitations

- The current hardening relies on route and component tests rather than a centralized middleware layer because this repo already centralizes the risk in helpers and handlers.
- URL-bearing free-text profile fields such as `website`, `linkedinUrl`, and `headshotUrl` are preserved as text in API responses; browser components remain responsible for routing those values through `normalizeLinkUrl()` before rendering them as navigation targets.
- The app still includes client-side `console.error` calls in login UX code. That is outside the server-side production logging scope for this feature, but should be cleaned later if client telemetry becomes centralized.

## Untrusted input inventory and control matrix

| Source                                                             | Representative files                                                                                                                                         | Browser/security context                    | Control                                                                                              |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Strapi blog title, excerpt, paragraph text, quote text, author bio | `src/app/blog/[slug]/page.tsx`, `src/components/BlogParagraph.tsx`, `src/components/BlogAuthor.tsx`                                                          | Text node content                           | React default escaping, regression tests for inert rendering                                         |
| Strapi rich-text link URLs                                         | `src/components/ParagraphRichText.tsx`                                                                                                                       | URL attribute, internal/external navigation | `normalizeLinkUrl()`, `isExternalUrl()`, fail closed to inert text                                   |
| Blog author profile links                                          | `src/components/BlogAuthor.tsx`                                                                                                                              | External anchor href                        | `normalizeLinkUrl()`, render no link when unsafe                                                     |
| Breadcrumb path segments                                           | `src/components/Breadcrumbs.tsx`                                                                                                                             | Text, internal navigation fragments         | Decode defensively, render inert fallback text                                                       |
| Navbar CMS links, hero CTA links, project card links               | `src/components/Navbar.js`, `src/components/Hero.js`, `src/components/ProjectCard.js`                                                                        | Internal/external navigation                | `normalizeLinkUrl()`, external `rel` hardening                                                       |
| Structured data / SEO JSON-LD                                      | `src/components/StructuredData.tsx`                                                                                                                          | Raw script context                          | `sanitizeStructuredDataJson()` before `dangerouslySetInnerHTML`                                      |
| Login `redirect` query param                                       | `src/app/login/page.tsx`, `src/app/login/login-client.tsx`, `src/app/verify-login/*`, `src/hooks/useGoogleOneTap.js`, `src/lib/auth/createMagicLoginLink.js` | Redirect destination                        | `normalizeRedirectPath()`, same-origin relative-only                                                 |
| Email magic-link `token` and OAuth callback params                 | `src/pages/api/auth/verify-login.js`, `src/pages/api/haro/mailbox/google/callback.js`                                                                        | Sensitive auth state, logs                  | Server-side verification, no raw token logging, non-cacheable responses                              |
| Auth session credential                                            | `src/lib/auth/session.js`, `src/pages/api/auth/session.js`, `src/pages/api/auth/logout.js`                                                                   | Session storage                             | Signed HttpOnly cookie only, no bearer fallback                                                      |
| HARO profile fields (`firstName`, `bio`, `signature`, URLs, etc.)  | `src/pages/api/haro/profile.js`, `src/app/haro/profile/HaroProfileClient.tsx`                                                                                | Text content, possible URL display          | Trim/normalize on write, React inert text rendering, UI must normalize links before anchor rendering |
| HARO pitches and ingested query data                               | `src/pages/api/haro/pitches.js`, `src/app/haro/pitches/page.js`, `src/components/HaroPitch.js`                                                               | Text content                                | React inert text rendering, no raw HTML insertion                                                    |
| HARO mailbox tokens and OAuth secrets                              | `src/pages/api/haro/mailbox/google/*`                                                                                                                        | Server-only credentials, logs               | Encrypted at rest, redacted logging, non-cacheable auth routes                                       |
| API query params `page`, `limit`, `source`                         | `src/pages/api/haro/pitches.js`                                                                                                                              | Server filtering and pagination             | Numeric bounds, string trimming, non-cacheable responses                                             |

## Final mapping summary

- **Text context**: React escaping
- **URL context**: `normalizeLinkUrl()` and external-link rel rules
- **Redirect context**: `normalizeRedirectPath()`
- **Script context**: `sanitizeStructuredDataJson()`
- **Authenticated API/cache context**: `readSession()`, HttpOnly cookie, `Cache-Control: no-store`
- **Logging context**: `createApiLogger()`, `serializeError()`, `redactLogFields()`, hashed user identity
