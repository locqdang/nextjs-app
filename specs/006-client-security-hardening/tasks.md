# Tasks: Client-Side Security Hardening

**Input**: Design documents from `/specs/006-client-security-hardening/`

**Prerequisites**: plan.md, spec.md

**Tests**: Required. This feature explicitly requires unit, integration, and browser-level regression coverage for rendering safety, redirect validation, cookie sessions, protected routes, and security headers.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g. US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Align the working branch and Spec Kit artifacts before implementation continues.

- [ ] T001 Reconcile current hardening branch changes against `specs/006-client-security-hardening/spec.md` and `specs/006-client-security-hardening/plan.md`
- [ ] T002 Create the untrusted-input inventory and control matrix in `specs/006-client-security-hardening/research.md`
- [ ] T003 Create the validation and state entity reference in `specs/006-client-security-hardening/data-model.md`
- [ ] T004 Create the executable verification guide in `specs/006-client-security-hardening/quickstart.md`
- [ ] T005 Create the browser-safety contract notes in `specs/006-client-security-hardening/contracts/security-boundaries.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the shared helpers, policies, and migration boundaries that all user stories depend on.

**⚠️ CRITICAL**: No user story work should be considered complete until this phase is done.

- [ ] T006 Review and finalize `src/lib/security.js` as the single normalization layer for link, redirect, and script-context safety
- [ ] T007 Review and finalize `src/lib/auth/session.js` as the canonical cookie-session boundary, including explicit decision on temporary bearer fallback
- [ ] T008 [P] Expand unit coverage for shared security helpers in `src/tests/lib/security.test.js`
- [ ] T009 [P] Expand unit coverage for shared auth-session helpers in `src/tests/lib/auth-session.test.js`
- [ ] T010 Finalize global security header and CSP baseline in `next.config.mjs`
- [ ] T011 [P] Update global header regression coverage in `src/tests/next-config-security-headers.test.js`
- [ ] T012 Audit `src/app/app-shell.tsx` for inline script and third-party loader behavior that constrains CSP

**Checkpoint**: Shared security helpers, cookie-session policy, and header policy are stable enough for story work.

---

## Phase 3: User Story 1 - User-controlled content cannot execute script (Priority: P1) 🎯 MVP

**Goal**: Ensure CMS content, user-entered content, and externally ingested content stay inert across text, URL, and JSON-LD/script contexts.

**Independent Test**: Seed malicious markup and URL payloads into representative blog, author, project, navbar, and HARO content paths and verify nothing executes, unsafe URLs fail closed, and JSON-LD remains inert.

### Tests for User Story 1

- [ ] T013 [P] [US1] Extend rich-text URL and unsafe-protocol coverage in `src/components/ParagraphRichText.test.tsx`
- [ ] T014 [P] [US1] Extend structured-data escaping coverage in `src/components/StructuredData.test.tsx`
- [ ] T015 [P] [US1] Extend cross-component safe-link coverage in `src/components/link-safety.test.tsx`
- [ ] T016 [US1] Add component or integration coverage for inert HARO/profile/pitch rendering in `src/tests/components/`

### Implementation for User Story 1

- [ ] T017 [US1] Finish safe rich-text link rendering in `src/components/ParagraphRichText.tsx`
- [ ] T018 [US1] Finish inert JSON-LD rendering in `src/components/StructuredData.tsx`
- [ ] T019 [P] [US1] Route all navbar and CMS navigation links through safe URL normalization in `src/components/Navbar.js`
- [ ] T020 [P] [US1] Route hero CTA links through safe URL normalization in `src/components/Hero.js`
- [ ] T021 [P] [US1] Route project card links through safe URL normalization in `src/components/ProjectCard.js`
- [ ] T022 [P] [US1] Fail closed on unsafe author/profile links in `src/components/BlogAuthor.tsx`
- [ ] T023 [P] [US1] Fail closed on unsafe breadcrumb targets in `src/components/Breadcrumbs.tsx`
- [ ] T024 [US1] Verify blog detail rendering remains inert across `src/app/blog/[slug]/page.tsx` and related blog components
- [ ] T025 [US1] Verify HARO profile rendering remains text-safe in `src/app/haro/profile/HaroProfileClient.tsx`
- [ ] T026 [US1] Verify HARO pitches rendering remains text-safe in `src/app/haro/pitches/page.js` and `src/components/HaroPitch.js`

**Checkpoint**: Blog, navigation, and HARO content paths resist stored/reflected XSS in the browser-facing render layer.

---

## Phase 4: User Story 2 - Authentication tokens are protected from client-side theft (Priority: P1)

**Goal**: Move auth to protected cookie-backed sessions, preserve login flows, and ensure post-login navigation remains same-origin only.

**Independent Test**: Complete email magic-link login, Google sign-in, logout, protected-route access, and protected HARO API requests while verifying session credentials are cookie-based and absent from `localStorage` and `sessionStorage`.

### Tests for User Story 2

- [ ] T027 [P] [US2] Extend redirect-validation and session bootstrap coverage in `src/tests/lib/security.test.js` and `src/tests/lib/auth-session.test.js`
- [ ] T028 [P] [US2] Add API session/login/logout integration coverage in `src/tests/api/`
- [ ] T029 [US2] Add browser regression coverage for cookie-backed login and absence of client token storage in the Playwright auth specs under `tests/` or the repo’s existing E2E location

### Implementation for User Story 2

- [ ] T030 [US2] Finish cookie-session client bootstrap and logout behavior in `src/lib/auth.tsx`
- [ ] T031 [US2] Finish same-origin redirect handling in `src/app/login/page.tsx` and `src/app/login/login-client.tsx`
- [ ] T032 [US2] Finish same-origin redirect handling and cookie-session completion in `src/app/verify-login/page.tsx` and `src/app/verify-login/verify-login-client.tsx`
- [ ] T033 [US2] Finish Google One Tap redirect and session behavior in `src/hooks/useGoogleOneTap.js`
- [ ] T034 [US2] Finish safe redirect propagation and login-link generation in `src/lib/auth/createMagicLoginLink.js` and `src/pages/api/auth/email-login.js`
- [ ] T035 [US2] Finish server-side session creation and cookie issuance in `src/pages/api/auth/verify-login.js` and `src/pages/api/auth/google.js`
- [ ] T036 [US2] Finish session introspection and logout cookie clearing in `src/pages/api/auth/session.js` and `src/pages/api/auth/logout.js`
- [ ] T037 [US2] Migrate protected HARO profile and pitches routes to canonical cookie-session auth in `src/pages/api/haro/profile.js` and `src/pages/api/haro/pitches.js`
- [ ] T038 [US2] Migrate mailbox OAuth auth checks to canonical cookie-session auth in `src/pages/api/haro/mailbox/google/start.js`, `src/pages/api/haro/mailbox/google/callback.js`, and `src/pages/api/haro/mailbox/disconnect.js`
- [ ] T039 [US2] Remove or time-box any remaining bearer-token compatibility in `src/lib/auth/session.js` and dependent routes once tests prove cookie-only flows work

**Checkpoint**: Authentication no longer depends on script-readable JWT storage, and protected flows still work end to end.

---

## Phase 5: User Story 3 - Security headers reduce browser attack surface (Priority: P2)

**Goal**: Enforce consistent browser security headers and a CSP that supports only the required first-party and Google integrations.

**Independent Test**: Inspect representative public pages, login pages, and authenticated API routes to verify expected CSP and related headers are present, compatible, and restrictive.

### Tests for User Story 3

- [ ] T040 [P] [US3] Extend header assertions for public and API route classes in `src/tests/next-config-security-headers.test.js`
- [ ] T041 [US3] Add verification steps for CSP-compatible Google integrations in `specs/006-client-security-hardening/quickstart.md`

### Implementation for User Story 3

- [ ] T042 [US3] Tighten CSP source allowlists and related browser headers in `next.config.mjs`
- [ ] T043 [US3] Align third-party script and identity loading with the final CSP decision in `src/app/app-shell.tsx`
- [ ] T044 [US3] Review cache-control behavior for authenticated HARO responses in `src/pages/api/haro/profile.js`, `src/pages/api/haro/pitches.js`, and mailbox OAuth routes
- [ ] T045 [US3] Document justified CSP exceptions, Google dependencies, and report-only or enforcement strategy in `specs/006-client-security-hardening/research.md` and `specs/006-client-security-hardening/contracts/security-boundaries.md`

**Checkpoint**: Browser hardening headers are explicit, justified, and regression-tested.

---

## Phase 6: User Story 4 - Regression tests cover security boundaries (Priority: P2)

**Goal**: Make the hardening durable by proving each distinct browser and auth boundary has a stable regression test.

**Independent Test**: Run the agreed verification suite and confirm every required context from the spec has targeted automated coverage.

### Tests for User Story 4

- [ ] T046 [P] [US4] Map each required context from `specs/006-client-security-hardening/spec.md` to an automated test in `specs/006-client-security-hardening/quickstart.md`
- [ ] T047 [US4] Add any missing integration or browser regressions needed to cover text, URL, redirect, script/JSON-LD, cookie-session, and header contexts in `src/tests/` and the existing Playwright suite

### Implementation for User Story 4

- [ ] T048 [US4] Remove duplicate or obsolete pre-hardening tests and consolidate final coverage around the canonical security helpers and browser journeys in `src/components/`, `src/tests/`, and the E2E suite
- [ ] T049 [US4] Update `specs/006-client-security-hardening/quickstart.md` with the final verification commands and expected outcomes
- [ ] T050 [US4] Update `specs/006-client-security-hardening/research.md` with the final input inventory, control mapping, and any remaining accepted limitations

**Checkpoint**: The hardening scope is documented and defended by durable regression coverage.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Finalize verification, documentation, and residual cleanup across all stories.

- [ ] T051 [P] Audit production logging paths to ensure security and auth errors never log raw tokens, cookies, magic links, or full malicious payloads in `src/lib/logger.js` and affected API routes
- [ ] T052 Run `npm run lint` from the repository root and fix any new issues required by this feature
- [ ] T053 Run `npm run test` from the repository root and fix any failing unit or integration regressions required by this feature
- [ ] T054 Run `npm run build` from the repository root and fix any build or CSP-related regressions required by this feature
- [ ] T055 Run the required Playwright or browser verification for login, blog, HARO profile, HARO pitches, and representative public routes
- [ ] T056 Run the final validation flow from `specs/006-client-security-hardening/quickstart.md` and record outcomes in the same file or an adjacent implementation note

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies, can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion, blocks all user stories
- **User Stories (Phases 3-6)**: Depend on Foundational completion
- **Polish (Phase 7)**: Depends on all targeted user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational, no dependency on later stories
- **User Story 2 (P1)**: Can start after Foundational, but should land before final auth and HARO verification is called complete
- **User Story 3 (P2)**: Can start after Foundational, but final CSP choices should consider User Story 2 auth flows and Google integrations
- **User Story 4 (P2)**: Depends on enough implementation from US1-US3 to consolidate final regression coverage

### Within Each User Story

- Write or extend the failing tests first when practical
- Shared helpers before dependent components or routes
- Component and route hardening before final browser verification
- Cookie-session route migration before removing bearer compatibility
- Final documentation updates after verification results are real

### Parallel Opportunities

- Phase 1 documentation tasks can run in parallel after T001
- Phase 2 test expansions T008, T009, and T011 can run in parallel
- In US1, component-level hardening tasks T019-T023 can run in parallel after shared helper decisions are stable
- In US2, API-focused tasks and client-flow tasks can be split across parallel workstreams after auth-session boundaries are finalized
- In US3, header assertions and documentation can proceed in parallel with CSP tightening once source requirements are known

---

## Parallel Example: User Story 1

```bash
# Parallel verification work after shared helper decisions are stable:
Task: "Extend rich-text URL and unsafe-protocol coverage in src/components/ParagraphRichText.test.tsx"
Task: "Extend structured-data escaping coverage in src/components/StructuredData.test.tsx"
Task: "Extend cross-component safe-link coverage in src/components/link-safety.test.tsx"

# Parallel implementation work for independent link-bearing components:
Task: "Route all navbar and CMS navigation links through safe URL normalization in src/components/Navbar.js"
Task: "Route hero CTA links through safe URL normalization in src/components/Hero.js"
Task: "Route project card links through safe URL normalization in src/components/ProjectCard.js"
```

---

## Implementation Strategy

### MVP First

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Complete Phase 4: User Story 2
5. **STOP and VALIDATE**: Run lint, targeted tests, and browser verification for the core XSS and auth-session risk reduction

### Incremental Delivery

1. Setup + Foundational
2. US1 content-rendering hardening
3. US2 cookie-session migration
4. US3 header and CSP tightening
5. US4 regression consolidation
6. Polish and final verification

### Suggested MVP Scope

For the first safe deliverable, treat **User Story 1 plus User Story 2** as the minimum meaningful scope. Rendering hardening without token-storage hardening still leaves too much blast radius if any XSS slips through.

---

## Notes

- Every task is anchored to the current `specs/006-client-security-hardening` feature directory
- This task list assumes a single-project Next.js repo rooted at `/home/loc/projects/vietpolyglots.com`
- Builder should execute from `tasks.md`, not directly from `spec.md`
- Do not remove temporary bearer fallback until cookie-backed route and browser verification are passing
- Keep all internal docs in English and user-facing copy in Vietnamese only where product text changes are required
