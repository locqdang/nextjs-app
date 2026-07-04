# Tasks: Google One Tap Behavior and Login Flow

## Phase 1: Setup

- [ ] T001 Create the canonical feature docs under `specs/004-google-one-tap/`
- [ ] T002 Verify the current app-shell, hook, login-client, and auth-route responsibilities

## Phase 2: Foundational

- [ ] T003 Confirm app-level initialization happens once
- [ ] T004 Confirm login-page button rendering remains login-DOM scoped
- [ ] T005 Confirm redirect target validation remains app-relative only

## Phase 3: User Story 1 - Logged-out user reaches intended destination after Google login

**Goal**: Preserve and tighten safe redirect behavior.

**Independent Test**: Logged-out user starts from a protected route and returns to the intended destination after login.

- [ ] T006 [US1] Verify protected-route redirect behavior
- [ ] T007 [US1] Tighten post-login fallback to `/` when no valid target exists
- [ ] T008 [US1] Add or update tests for redirect validation and fallback behavior

## Phase 4: User Story 2 - Google sign-in UI behaves correctly across app and login page

**Goal**: Preserve separation between initialization, button rendering, and One Tap prompt behavior.

**Independent Test**: App initializes once, login button renders on login page, One Tap remains eligible elsewhere.

- [ ] T009 [US2] Verify app-shell initialization in `src/app/app-shell.tsx`
- [ ] T010 [US2] Verify hook behavior in `src/hooks/useGoogleOneTap.js`
- [ ] T011 [US2] Verify login button rendering in `src/app/login/login-client.tsx`

## Phase 5: User Story 3 - Operator avoids redirect and prompt regressions

**Goal**: Document or refine prompt gating and fallback behavior.

**Independent Test**: Prompt behavior and redirect fallback match the documented rules.

- [ ] T012 [US3] Decide whether prompt gating or suppression is needed on specific routes
- [ ] T013 [US3] Document the final prompt behavior rules
- [ ] T014 [US3] Run final verification for initialization, rendering, and redirect behavior
