# Feature Specification: Client-Side Security Hardening

**Feature Branch**: `006-client-security-hardening`

**Created**: 2026-07-07

**Status**: Draft

**Input**: User description: "Harden vietpolyglots.com against XSS and related client-side security issues. Inspect user-controlled input paths, rendering contexts, authentication/session handling, existing headers/sanitization, and define implementable scope, threat model, changes, and acceptance criteria."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - User-controlled content cannot execute script (Priority: P1)

Visitors, signed-in users, and admins can view blog posts, HARO profiles, HARO pitches, navigation, metadata, and search/filter results without any user-controlled or CMS-controlled value being interpreted as executable script, dangerous markup, or unsafe URL navigation.

**Why this priority**: Preventing cross-site scripting is the core safety outcome; an attacker must not be able to steal session data, redirect users, or modify page behavior through stored or reflected content.

**Independent Test**: Seed or submit malicious payloads through every identified user-controlled source and verify they render as inert text or are rejected/normalized before display.

**Acceptance Scenarios**:

1. **Given** a CMS blog field contains `<img src=x onerror=alert(1)>`, **When** a visitor opens the blog listing or blog detail page, **Then** the payload is displayed as text or omitted and no script executes.
2. **Given** rich text link data contains `javascript:alert(1)`, `data:text/html,...`, or malformed protocol-relative input, **When** the blog paragraph renderer displays it, **Then** the value is not used as a clickable dangerous URL.
3. **Given** structured-data SEO input contains `</script><script>alert(1)</script>`, **When** the blog detail page renders JSON-LD, **Then** the JSON-LD remains valid inert data and no extra script node executes.
4. **Given** HARO profile fields or pitch data contain HTML tags or script-like text, **When** the profile summary or pitches page renders them, **Then** React text rendering keeps the content inert.

---

### User Story 2 - Authentication tokens are protected from client-side theft (Priority: P1)

Signed-in users can authenticate through email magic links or Google sign-in while session credentials are protected against common client-side theft and replay risks.

**Why this priority**: The current auth flow persists JWTs in browser localStorage, so any XSS defect can directly expose account tokens. Moving session material out of script-readable storage sharply limits blast radius.

**Independent Test**: Complete login, authenticated HARO API calls, logout, and protected-route access while verifying session credentials are stored only in cookies with appropriate protections and are not readable through browser JavaScript.

**Acceptance Scenarios**:

1. **Given** a user completes email magic-link login, **When** the browser stores the session, **Then** the session token is set in an HttpOnly cookie and no JWT is written to localStorage.
2. **Given** a user completes Google sign-in, **When** authenticated API calls are made, **Then** server-side routes authenticate from the protected cookie or an equivalent server-verifiable session mechanism without requiring JavaScript to read the token.
3. **Given** a user signs out or the session expires, **When** the user opens protected HARO pages or calls protected HARO APIs, **Then** access is denied and the session cookie is cleared or ignored.
4. **Given** the site is served over HTTPS, **When** cookies are inspected, **Then** production cookies use Secure, HttpOnly, and an explicit SameSite policy appropriate for same-site app navigation and OAuth/magic-link flows.

---

### User Story 3 - Security headers reduce browser attack surface (Priority: P2)

All users receive consistent browser security headers that reduce XSS impact, block unsafe framing/sniffing, limit referrer leakage, and define an explicit content security policy for first-party code plus required third-party services.

**Why this priority**: Defense-in-depth protects users if a rendering bug or dependency issue appears later.

**Independent Test**: Request representative public, login, blog, HARO, and `/video-meeting` pages and verify expected headers are present and compatible with Google Tag Manager, Google Identity, and the self-hosted Cal.com iframe at `https://cal.vietpolyglots.com`.

**Acceptance Scenarios**:

1. **Given** a browser requests any page, **When** response headers are inspected, **Then** Content-Security-Policy, X-Content-Type-Options, Referrer-Policy, frame controls, and permissions restrictions are present.
2. **Given** Google Tag Manager, Google Identity, and the self-hosted Cal.com booking interface are required, **When** CSP is enforced, **Then** only the minimum necessary Google and `https://cal.vietpolyglots.com` sources are allowed.
3. **Given** an authenticated user opens `/video-meeting`, **When** nonce-based CSP is enforced, **Then** the iframe at `https://cal.vietpolyglots.com/loc/meet-loc` renders and availability loads.
4. **Given** an inline or injected script not covered by the policy is present, **When** the page loads, **Then** the browser blocks the script and reports or logs the violation for debugging.

---

### User Story 4 - Regression tests cover security boundaries (Priority: P2)

Developers can change blog rendering, auth, HARO forms, and headers with automated tests that catch XSS regressions, unsafe redirects, unsafe URLs, and session-storage regressions before release.

**Why this priority**: Security hardening must remain stable as content models and login flows evolve.

**Independent Test**: Run the project test suite and verify it includes targeted unit, integration, and browser-level checks for the hardening requirements.

**Acceptance Scenarios**:

1. **Given** a developer changes rich-text rendering, **When** tests run, **Then** malicious link protocols and markup payloads are covered.
2. **Given** a developer changes login or protected API behavior, **When** tests run, **Then** session cookie attributes and absence of localStorage token writes are covered.
3. **Given** a developer changes app shell, config, or middleware, **When** tests run, **Then** security headers and CSP compatibility are covered.

### Edge Cases

- CMS rich text may contain unknown node types, nested children, empty links, malformed URLs, unicode/control characters, or strings that look like hostnames; dangerous protocols must fail closed.
- URL-bearing fields can appear in blog links, images, SEO metadata, HARO profile website, LinkedIn URL, headshot URL, OAuth callback URLs, login redirect query params, and API filter params.
- Login redirect parameters may point to absolute URLs, protocol-relative URLs, encoded absolute URLs, backslash variants, or JavaScript/data URLs; only same-origin relative destinations are allowed.
- JSON-LD script content is a deliberate `dangerouslySetInnerHTML` use; escaping must cover `<`, script terminators, and any additional characters required to keep script context inert.
- Third-party requirements for Google Tag Manager, Google Identity, and self-hosted Cal.com may conflict with strict CSP; the solution must document the required nonce/hash and minimum exact source allowlist. A nonce does not replace the Cal.com iframe origin allowlist.
- HARO pitch and profile data may originate from external email/query ingestion pipelines rather than direct UI entry; stored data must still be treated as untrusted at render time.
- Development environments may use HTTP; cookie Secure behavior may differ locally but production behavior must be enforced and tested.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST maintain an inventory of all untrusted input sources and their render contexts before implementation is considered complete.
- **FR-002**: System MUST treat the following inspected sources as untrusted: Strapi/blog title, excerpt, author, cover image fields, rich-text blocks, rich-text link URLs, SEO metadata and structured data; HARO profile fields `firstName`, `lastName`, `company`, `companyNiche`, `website`, `jobTitle`, `bio`, `linkedinUrl`, `headshotUrl`, and `signature`; HARO pitch/query fields including `query`, `expert_pitch`, `humanized_pitch`, `proposed_pitch`, `media_outlet`, `journalist_name`, `deadline`, and `query_source`; auth query params `token` and `redirect`; OAuth callback params; API query params `page`, `limit`, and `source`; user email and Google profile data; navigation/menu data from CMS if present.
- **FR-003**: System MUST keep React text and attribute rendering as the default safe rendering pattern and MUST prohibit new raw HTML rendering unless a documented exception includes context-specific escaping or sanitization and tests.
- **FR-004**: System MUST review and harden the existing raw script rendering in `src/components/StructuredData.tsx`; JSON-LD data MUST be serialized so it cannot terminate the script block or create executable markup.
- **FR-005**: System MUST review and harden inline third-party script usage in `src/app/app-shell.tsx`; required inline code MUST be compatible with the chosen CSP through a nonce/hash or an equivalent safe pattern.
- **FR-006**: System MUST validate URL-bearing untrusted values by context and allow only appropriate schemes: internal links may be relative or fragment-only, external links may use `https:` or `http:` only when explicitly allowed, and `javascript:`, `data:`, `vbscript:`, unsafe protocol-relative values, and malformed values MUST be rejected or rendered as inert text.
- **FR-007**: System MUST specifically cover `src/components/ParagraphRichText.tsx` link normalization, `next/link` targets, external anchors, `rel` values, and target behavior with tests for malicious and malformed URLs.
- **FR-008**: System MUST validate redirect destinations used by `src/app/login/page.tsx`, `src/app/login/login-client.tsx`, `src/app/verify-login/page.tsx`, `src/app/verify-login/verify-login-client.tsx`, `src/hooks/useGoogleOneTap.js`, and `src/lib/auth/createMagicLoginLink.js`; only same-origin relative paths may be accepted for post-login routing.
- **FR-009**: System MUST replace script-readable JWT persistence in `src/lib/auth.tsx` and related clients with HttpOnly cookie-based or equivalent server-managed session handling for production auth.
- **FR-010**: System MUST set authentication cookies with HttpOnly, Secure in production, explicit SameSite, Path, Max-Age/Expires, and clear-cookie behavior on logout/session invalidation.
- **FR-011**: System MUST update protected API routes including `src/pages/api/haro/profile.js`, `src/pages/api/haro/pitches.js`, `src/pages/api/haro/mailbox/google/start.js`, `src/pages/api/haro/mailbox/google/callback.js`, and `src/pages/api/haro/mailbox/disconnect.js` so authorization does not depend on localStorage-readable bearer tokens.
- **FR-012**: System MUST preserve email magic-link and Google sign-in user journeys while changing session storage; redirects after login MUST remain bounded to safe same-origin destinations.
- **FR-013**: System MUST add centralized security headers for all app and API responses where applicable, covering Content-Security-Policy, X-Content-Type-Options, Referrer-Policy, frame restrictions, permissions restrictions, and caching rules for sensitive authenticated responses.
- **FR-014**: Content-Security-Policy MUST start in report-only mode if needed to tune third-party sources, then define an enforcement-ready policy that avoids broad `unsafe-inline`/`unsafe-eval` allowances except where explicitly justified and time-boxed.
- **FR-015**: System MUST keep sensitive authenticated HARO API responses non-cacheable and verify no sensitive profile, mailbox, or pitch data is stored in shared caches.
- **FR-016**: System MUST normalize and bound input lengths for user-submitted profile fields and auth/API parameters to reduce injection, logging, and denial-of-service risk while preserving legitimate user content.
- **FR-017**: System MUST ensure logged security/auth errors do not include raw tokens, magic links, cookies, credentials, or full malicious payloads in production logs.
- **FR-018**: System MUST add regression tests for output escaping by context, unsafe URL rejection, redirect validation, cookie attributes, protected route/API behavior, security headers, and the existing JSON-LD raw script exception.
- **FR-019**: System MUST document any deliberate exceptions, such as required Google scripts or JSON-LD rendering, with the exact risk control and test that covers the exception.
- **FR-020**: System MUST fail closed: when an input value cannot be validated for its render or navigation context, it is omitted, replaced with a safe fallback, or rendered as plain text rather than passed through.
- **FR-024**: System MUST permit the existing Cal.com booking iframe only from `https://cal.vietpolyglots.com`, including `frame-src` and only additional CSP directives proven necessary by browser/network verification; wildcard Cal.com or broad scheme allowances MUST NOT be introduced.
- **FR-025**: System MUST preserve `/video-meeting` authentication behavior and verify `https://cal.vietpolyglots.com/loc/meet-loc` renders and loads availability under final nonce-based production CSP.

### File and Module Targets Identified During Inspection

- `src/components/ParagraphRichText.tsx`: rich-text text rendering, link URL normalization, external link attributes.
- `src/components/StructuredData.tsx`: JSON-LD `dangerouslySetInnerHTML` exception.
- `src/app/blog/[slug]/page.tsx`, `src/components/BlogParagraph.tsx`, `src/components/BlogAuthor.tsx`, `src/components/BlogCoverImage.tsx`, `src/components/RelatedBlogs.tsx`, `src/components/BlogToc.tsx`, `src/components/Breadcrumbs.tsx`: CMS/blog rendering contexts.
- `src/app/app-shell.tsx` and any app/middleware/config location used for headers: Google Tag Manager, Google Identity script loading, global headers, and nonce propagation.
- `src/app/video-meeting/page.js`, `src/components/Booking.js`, and `e2e/video-meeting.spec.js`: authenticated Cal.com iframe integration.
- `src/lib/auth.tsx`, `src/app/login/page.tsx`, `src/app/login/login-client.tsx`, `src/app/verify-login/page.tsx`, `src/app/verify-login/verify-login-client.tsx`, `src/hooks/useGoogleOneTap.js`: client auth state, redirects, Google One Tap/button behavior.
- `src/pages/api/auth/email-login.js`, `src/pages/api/auth/verify-login.js`, `src/pages/api/auth/google.js`, `src/lib/auth/createMagicLoginLink.js`: session creation, magic link creation, redirect propagation.
- `src/app/haro/profile/HaroProfileClient.tsx`, `src/pages/api/haro/profile.js`: user-editable profile fields and authenticated profile API.
- `src/app/haro/pitches/page.js`, `src/components/HaroPitch.js`, `src/pages/api/haro/pitches.js`: externally ingested pitch/query data and query filters.
- `src/pages/api/haro/mailbox/google/start.js`, `src/pages/api/haro/mailbox/google/callback.js`, `src/pages/api/haro/mailbox/disconnect.js`: OAuth redirects/state and authenticated mailbox actions.
- Test targets: existing `src/components/ParagraphRichText.test.ts`, `src/tests/**`, and new unit/integration/e2e tests as needed.

### Key Entities _(include if feature involves data)_

- **Untrusted Content Value**: Any value originating from a visitor, signed-in user, CMS, external HARO/query ingestion, OAuth provider, email magic-link URL, query string, or database field whose integrity is not guaranteed at render time.
- **Rendering Context**: The browser context in which an untrusted value appears, including text node, HTML attribute, URL attribute, script/JSON-LD block, metadata, redirect destination, or API response.
- **Session Credential**: The token or cookie proving authenticated user identity; must not be accessible to arbitrary client-side JavaScript in production.
- **Security Header Policy**: The site-wide browser enforcement configuration, especially CSP and related headers.
- **Security Regression Test**: An automated test using malicious payloads or header/session assertions to prevent reintroduction of unsafe behavior.

## Threat Model

### In Scope

- Stored XSS through CMS/blog content, SEO structured data, HARO profile data, HARO pitch/query data, user names/emails, and navigation/menu content.
- Reflected XSS or unsafe navigation through query parameters such as `redirect`, `token`, `source`, pagination params, and OAuth callback parameters.
- DOM-based XSS or open redirect caused by client-side `router.push`, `window.location.href`, URL normalization, third-party script callbacks, or localStorage/session reads.
- Session theft or replay caused by localStorage-readable JWTs combined with any XSS flaw.
- CSP bypass risk caused by broad inline script allowances or missing third-party source boundaries.
- Sensitive data exposure through cacheable authenticated API responses or production logs.

### Out of Scope

- Full dependency vulnerability remediation unrelated to XSS/client-side security unless required for this hardening work.
- Replacing Google Tag Manager, Google Identity, or self-hosted Cal.com as product integrations; the feature should constrain them safely rather than remove them.
- Broader account authorization redesign beyond the changes needed to protect session credentials and preserve existing protected HARO behavior.
- Server-side NoSQL injection review except for direct query parameters touched while hardening input validation.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% of inventoried untrusted input paths have a documented rendering context and an assigned validation, escaping, sanitization, rejection, or safe-rendering control.
- **SC-002**: 0 seeded XSS payloads execute across blog detail, blog listing, login, verify-login, HARO profile, HARO pitches, navigation, and structured-data test scenarios.
- **SC-003**: 100% of production authentication session credentials are inaccessible to browser JavaScript through localStorage, sessionStorage, or non-HttpOnly cookies.
- **SC-004**: 100% of authentication cookies in production include HttpOnly, Secure, SameSite, Path, and expiry semantics verified by automated tests or deploy-time checks.
- **SC-005**: 100% of representative public and authenticated pages return the agreed security headers, including a CSP that blocks unapproved inline or third-party scripts.
- **SC-006**: Existing login, Google sign-in, magic-link verification, HARO profile, HARO pitches, and Gmail mailbox flows continue to pass regression tests after hardening.
- **SC-007**: The test suite includes at least one malicious-payload regression test for each distinct browser context: text, URL attribute, script/JSON-LD, redirect destination, authenticated API response, and security headers.

## Assumptions

- The app is a Next.js site using React escaping by default, legacy `src/pages/api` API routes, and app-router pages under `src/app`.
- Strapi/blog, HARO database records, Google profile data, and magic-link/OAuth query parameters are all treated as untrusted even when produced by internal workflows.
- The normal Spec Kit feature directory is `specs/NNN-short-name`; this feature uses `specs/006-client-security-hardening` based on existing `001` through `005` spec directories.
- Production is served over HTTPS, allowing Secure cookies and strict transport-compatible security headers.
- Google Tag Manager ID `GTM-TNTD5HRS` and Google Identity script are intentionally retained, but must be represented explicitly in CSP.
- Saved spec artifact is sufficient deliverable for this task; implementation and deeper planning can proceed in later Spec Kit phases.
