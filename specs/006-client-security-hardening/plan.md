# Implementation Plan: Client-Side Security Hardening

**Branch**: `006-client-security-hardening` | **Date**: 2026-07-07 | **Spec**: `specs/006-client-security-hardening/spec.md`

**Input**: Feature specification from `specs/006-client-security-hardening/spec.md`

## Summary

Harden `vietpolyglots.com` against stored, reflected, and DOM-based client-side attacks by inventorying every untrusted browser-facing input path, enforcing fail-closed URL and redirect handling, moving authentication fully to protected cookie-backed sessions, tightening browser security headers and CSP around the existing Google integrations, and adding regression tests that lock these boundaries in place.

This plan is intentionally based on the current repo state, not a blank slate. The branch already contains partial hardening work such as cookie session helpers, URL normalization helpers, JSON-LD escaping, header tests, and auth-session tests. Implementation should treat those changes as the baseline, verify them, then close the remaining gaps instead of rebuilding the same controls twice.

## Technical Context

**Language/Version**: JavaScript and TypeScript in a Next.js 16 application running on Node.js

**Primary Dependencies**: Next.js App Router plus `src/pages/api`, React 19, existing auth helpers, Google Identity, Google Tag Manager, Vitest, Playwright, `jsonwebtoken`

**Storage**: Existing MongoDB and Strapi-backed content/data, browser cookies for authenticated session state, no client-side token storage in production

**Testing**: Vitest unit/integration tests plus Playwright browser checks for auth, navigation, and representative public/private routes

**Target Platform**: HTTPS-served production web app, local development over HTTP, same-origin frontend and API routes under Next.js

**Project Type**: Web application

**Performance Goals**: Preserve current UX and login flows while adding negligible rendering overhead and no extra client-side auth round trips beyond the existing session bootstrap

**Constraints**: Preserve Google Tag Manager and Google Identity, avoid broad `unsafe-inline` and `unsafe-eval` CSP allowances unless explicitly justified, keep authenticated HARO responses non-cacheable, do not log raw credentials/tokens/magic links/payloads

**Scale/Scope**: Blog/CMS renderers, structured data, navbar/menu links, project/hero links, login and verify-login redirect flows, Google One Tap hooks, session creation/verification/logout APIs, HARO protected APIs and clients, and global headers/CSP

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- Keep the hardening incremental and compatible with the existing Next.js architecture.
- Default to React-safe text/attribute rendering and document every exception.
- Fail closed for any untrusted value whose browser context cannot be safely validated.
- Preserve working login and HARO flows while reducing token exposure.
- Verification must include real tests for headers, redirects, URL handling, and cookie-backed auth.

Gate status: Pass.

## Project Structure

### Documentation (this feature)

```text
specs/006-client-security-hardening/
├── plan.md
├── spec.md
└── checklists/
    └── requirements.md
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── app-shell.tsx
│   ├── blog/[slug]/page.tsx
│   ├── login/
│   ├── verify-login/
│   └── haro/
├── components/
│   ├── ParagraphRichText.tsx
│   ├── StructuredData.tsx
│   ├── Navbar.js
│   ├── Hero.js
│   ├── ProjectCard.js
│   ├── BlogAuthor.tsx
│   └── Breadcrumbs.tsx
├── hooks/
│   └── useGoogleOneTap.js
├── lib/
│   ├── auth.tsx
│   ├── auth/
│   │   ├── createMagicLoginLink.js
│   │   └── session.js
│   └── security.js
├── pages/api/
│   ├── auth/
│   └── haro/
└── tests/

next.config.mjs
```

**Structure Decision**: Keep hardening logic centralized in `src/lib/security.js` and `src/lib/auth/session.js`, keep renderers and route handlers thin, and extend the existing test layout rather than introducing a parallel security framework.

## Phase 0: Research Summary

Current inspection already establishes these baseline facts:

- `src/lib/security.js` exists and currently provides `sanitizeStructuredDataJson`, `normalizeLinkUrl`, `isExternalUrl`, and `normalizeRedirectPath`.
- `src/lib/auth/session.js` exists and currently provides signed JWT cookie helpers, SameSite/Secure handling, cookie parsing, and temporary bearer-token fallback for route migration.
- `src/lib/auth.tsx` already loads session state from `/api/auth/session` and no longer exposes a client-readable token value through context.
- `next.config.mjs` already defines site-wide CSP and related headers, plus `Cache-Control`/`Pragma` for `/api/*`.
- The branch already contains targeted tests for security helpers, auth session cookies, and next-config security headers.
- The git tree is currently dirty with many relevant hardening changes in progress, so implementation should start by verifying what is already done versus what is still missing before generating task slices.

Open research/design questions to settle before or during Phase 1:

1. Whether current CSP can remain header-based in `next.config.mjs` or needs nonce support because of any required inline scripts in `src/app/app-shell.tsx`.
2. Whether Google One Tap and Google button flows require `SameSite=Lax` only, or any deployment path genuinely needs `SameSite=None`.
3. Which protected HARO/API routes still rely on legacy bearer semantics and can be cut over completely.
4. Whether any remaining browser-facing renderers still accept unsafe URL-shaped data or raw metadata/script contexts beyond the already identified files.

## Phase 1: Design Artifacts

Implementation should produce or update the following design artifacts before final task generation is considered complete:

- **Untrusted input inventory**: a source-to-context matrix covering every item from FR-001/FR-002.
- **Security control mapping**: for each input path, identify safe React text rendering, URL validation, redirect validation, script-context escaping, cookie/session control, cache control, or explicit rejection/fallback.
- **CSP compatibility notes**: exact required Google origins, whether report-only staging is needed, and any nonce/hash strategy if inline script remains necessary.
- **Session migration notes**: exact state transition from temporary bearer fallback to cookie-only server auth, including logout and session expiry behavior.
- **Regression-test matrix**: one test per distinct browser/security context called out by SC-007.

Recommended artifact files if the feature is expanded beyond this plan:

- `specs/006-client-security-hardening/research.md`
- `specs/006-client-security-hardening/data-model.md`
- `specs/006-client-security-hardening/contracts/security-boundaries.md`
- `specs/006-client-security-hardening/quickstart.md`
- `specs/006-client-security-hardening/tasks.md`

## Design Decisions

### 1. Treat `src/lib/security.js` as the single browser-safety normalization layer

Do not scatter ad hoc URL or redirect checks across components. Extend and verify `normalizeLinkUrl` and `normalizeRedirectPath`, then make all browser navigation and URL-bearing renderers route through those helpers.

### 2. Treat `src/lib/auth/session.js` as the canonical auth-session boundary

All authenticated browser flows should converge on server-set HttpOnly cookies and server-side session reads. Temporary bearer compatibility may exist during migration, but the plan should remove route dependence on client-readable tokens as the end state.

### 3. Preserve React’s default escaping model

Do not introduce sanitization libraries for content that is already safely rendered as text nodes or attributes by React. Reserve special handling for the genuinely dangerous contexts: URL attributes, redirects, JSON-LD/script context, and any unavoidable third-party inline script glue.

### 4. Keep CSP tight and explicit around Google integrations

The current header already names Google origins. Tightening work should focus on removing unnecessary allowances, documenting each retained source, and adding report-only tuning only if enforcement would currently break production behavior.

### 5. Fail closed everywhere

Unsafe, malformed, unknown, or unvalidated values should become `null`, fall back to `/`, or render as plain text. The plan should never preserve questionable navigation or raw script behavior for convenience.

## Implementation Workstreams

### Workstream A: Inventory and classify all untrusted input paths

Goal: Produce the authoritative map required by FR-001 and SC-001.

Scope:
- Blog and Strapi content paths
- Structured data and metadata
- Navbar/menu and CTA links
- Project cards and hero links
- HARO profile fields and pitch/query data
- Auth query params and OAuth callback params
- User profile/email/name fields
- API query parameters and pagination/filter inputs

Primary files to inspect/annotate:
- `src/components/ParagraphRichText.tsx`
- `src/components/StructuredData.tsx`
- `src/components/Navbar.js`
- `src/components/Hero.js`
- `src/components/ProjectCard.js`
- `src/components/BlogAuthor.tsx`
- `src/components/Breadcrumbs.tsx`
- `src/app/blog/[slug]/page.tsx`
- `src/app/login/page.tsx`
- `src/app/verify-login/page.tsx`
- `src/hooks/useGoogleOneTap.js`
- `src/app/haro/profile/HaroProfileClient.tsx`
- `src/app/haro/pitches/page.js`

Deliverable:
- Documented source-to-context matrix with a named control for every path.

### Workstream B: Finish output-context hardening for browser rendering

Goal: Ensure all untrusted content is safe in text, attribute, link, and script contexts.

Expected actions:
- Verify every link-bearing component uses `normalizeLinkUrl` consistently.
- Confirm external links set safe `rel` and target behavior.
- Confirm same-origin absolute URLs normalize to root-relative paths where appropriate.
- Verify `StructuredData.tsx` remains the only deliberate raw-script exception and that `sanitizeStructuredDataJson` covers script-breakout characters.
- Review `app-shell.tsx` for any inline script or third-party loader behavior that affects CSP feasibility.
- Ensure any metadata or JSON-LD generation code never interpolates raw strings into executable HTML/script contexts.

Likely file targets:
- `src/components/ParagraphRichText.tsx`
- `src/components/StructuredData.tsx`
- `src/components/Navbar.js`
- `src/components/Hero.js`
- `src/components/ProjectCard.js`
- `src/components/BlogAuthor.tsx`
- `src/components/Breadcrumbs.tsx`
- `src/app/app-shell.tsx`
- `src/app/blog/[slug]/page.tsx`

### Workstream C: Complete redirect hardening and auth session migration

Goal: Eliminate localStorage-readable session exposure and ensure redirect destinations are same-origin only.

Expected actions:
- Verify `src/lib/auth.tsx` never reads/writes `localStorage` or `sessionStorage` for tokens.
- Verify login and verify-login client flows rely on cookie-backed `/api/auth/session` state and `Set-Cookie` responses.
- Validate all post-login redirects through `normalizeRedirectPath`.
- Keep logout/session-expiry behavior aligned with protected-route denial and cookie clearing.
- Remove remaining route dependence on bearer auth once protected routes and clients are migrated.
- Ensure mailbox OAuth start/callback/disconnect routes authenticate from the server-managed session boundary.

Likely file targets:
- `src/lib/auth.tsx`
- `src/lib/auth/session.js`
- `src/lib/auth/createMagicLoginLink.js`
- `src/app/login/page.tsx`
- `src/app/login/login-client.tsx`
- `src/app/verify-login/page.tsx`
- `src/app/verify-login/verify-login-client.tsx`
- `src/hooks/useGoogleOneTap.js`
- `src/pages/api/auth/email-login.js`
- `src/pages/api/auth/verify-login.js`
- `src/pages/api/auth/google.js`
- `src/pages/api/auth/session.js`
- `src/pages/api/auth/logout.js`
- `src/pages/api/haro/profile.js`
- `src/pages/api/haro/pitches.js`
- `src/pages/api/haro/mailbox/google/start.js`
- `src/pages/api/haro/mailbox/google/callback.js`
- `src/pages/api/haro/mailbox/disconnect.js`

### Workstream D: Tighten browser security headers and caching policy

Goal: Make the browser default to a safer execution environment for both public and authenticated routes.

Expected actions:
- Re-check `Content-Security-Policy` source list against the actual scripts, frames, images, and connect endpoints in use.
- Decide whether to stage with `Content-Security-Policy-Report-Only` before strict enforcement.
- Keep `X-Content-Type-Options`, `Referrer-Policy`, frame restrictions, and `Permissions-Policy` explicit.
- Confirm sensitive authenticated endpoints remain `no-store` and not shared-cacheable.
- Verify whether page routes need any additional cache directives beyond current API rules for private content.

Primary file targets:
- `next.config.mjs`
- `src/app/app-shell.tsx`
- Any API routes returning authenticated HARO/mailbox data

### Workstream E: Lock in regression coverage

Goal: Prevent future regressions in every distinct security context named by the spec.

Expected actions:
- Extend unit tests for URL normalization and redirect normalization edge cases.
- Keep explicit tests for JSON-LD/script escaping.
- Extend auth-session tests for cookie attributes, expiry, clearing, and any final removal of bearer fallback.
- Add/extend component tests for safe link rendering in blog/authorship/navigation contexts.
- Add integration tests for protected API routes authenticating from cookies rather than browser-readable tokens.
- Add browser-level checks that login still works, protected pages still gate correctly, and localStorage does not receive auth tokens.
- Keep header assertions for representative public and API routes.

Likely test targets:
- `src/tests/lib/security.test.js`
- `src/tests/lib/auth-session.test.js`
- `src/tests/next-config-security-headers.test.js`
- `src/components/ParagraphRichText.test.tsx`
- `src/components/StructuredData.test.tsx`
- `src/components/link-safety.test.tsx`
- `src/tests/components/**`
- Existing Playwright auth/blog/HARO specs

## Phase 2 Preview

Task generation should follow this order:

1. Verify the current dirty-branch baseline and mark which spec requirements are already satisfied in code/tests.
2. Produce the untrusted-input inventory and context/control mapping.
3. Finish renderer/link/script-context hardening for any remaining unsafe or unverified paths.
4. Finish cookie-session migration and remove remaining bearer-token dependency from protected routes and clients.
5. Tighten CSP and related headers around actual Google/script requirements.
6. Extend unit, integration, and browser regression coverage for all distinct contexts.
7. Run lint, unit/integration tests, build, and targeted E2E verification.
8. Patch the spec artifacts to reflect any final design decisions or justified exceptions.

## Verification Strategy

Minimum verification before implementation can be called complete:

- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run test:e2e` or a narrowly scoped Playwright subset if the full suite is too expensive during iteration
- Direct assertions that no auth token is written to `localStorage` or `sessionStorage`
- Direct assertions that login, verify-login, HARO profile, HARO pitches, and mailbox OAuth still work with cookie-backed auth
- Direct assertions that representative public and API routes emit the expected security headers
- Malicious-payload checks for at least these contexts: text, URL attribute, redirect destination, JSON-LD/script block, and authenticated API/cache behavior

## Risks and Mitigations

- **Risk**: CSP tightening breaks Google Tag Manager or Google Identity.
  **Mitigation**: Inventory exact third-party origins, use report-only tuning if needed, and verify login/marketing flows before enforcement.

- **Risk**: Partial auth migration leaves mixed cookie and bearer expectations across routes.
  **Mitigation**: Centralize route auth on `readSession`, explicitly track temporary fallback, and remove it only after all dependent clients are migrated.

- **Risk**: False confidence from helper tests while a component bypasses the helper.
  **Mitigation**: Complete the source-to-context inventory and add component-level tests for every distinct link/render path.

- **Risk**: Sensitive authenticated data remains cacheable on some route class.
  **Mitigation**: Audit authenticated endpoints and private pages explicitly, not just `next.config.mjs` globals.

- **Risk**: Dirty working tree hides already-completed work or mixes unrelated changes into the hardening implementation.
  **Mitigation**: Start by reconciling current files/tests with spec requirements and stage only the files that belong to this feature.

## Complexity Tracking

No constitution violations currently require justification.
