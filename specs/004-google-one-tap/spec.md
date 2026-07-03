# Feature Specification: Google One Tap Behavior and Login Flow

**Feature Branch**: `004-google-one-tap`

**Created**: 2026-07-03

**Status**: Draft

**Input**: Migrated from legacy notes in `tickets/google-one-tap.md`

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Logged-out user reaches intended destination after Google login (Priority: P1)

As a logged-out user, I want protected pages to send me to login and then return me to the correct in-app destination after successful Google login.

**Why this priority**: Correct login and redirect behavior is the core user-facing outcome for Google sign-in.

**Independent Test**: Visit a protected route such as `/haro` while logged out, complete Google login, and confirm the app redirects back to the intended in-app route.

**Acceptance Scenarios**:

1. **Given** a logged-out user visits a protected route, **When** the app redirects them to login, **Then** the requested in-app destination is preserved.
2. **Given** a login route includes a valid app-relative redirect target, **When** Google login succeeds, **Then** the user is sent to that target.
3. **Given** no valid redirect target is present, **When** Google login succeeds, **Then** the app falls back to the default safe destination.

---

### User Story 2 - Google sign-in UI behaves correctly across app and login page (Priority: P2)

As a user, I want the Google sign-in button to appear where expected and the One Tap prompt to remain eligible across the app without duplicated initialization.

**Why this priority**: The app uses two related but distinct behaviors, and clarity between them prevents regressions and confusing login UX.

**Independent Test**: Load the app, navigate to login, confirm the button renders only when the login UI mounts, and verify the One Tap prompt can still appear on eligible pages without repeated initialization.

**Acceptance Scenarios**:

1. **Given** the app shell loads, **When** Google Identity Services initializes, **Then** it initializes once at the app level.
2. **Given** the login UI mounts, **When** the login page is ready, **Then** the Google sign-in button renders in the login-page DOM.
3. **Given** a user is eligible for One Tap, **When** they browse eligible pages, **Then** the prompt may appear without requiring button rendering in the app shell.

---

### User Story 3 - Operator avoids redirect and prompt regressions (Priority: P3)

As the site operator, I want redirect handling and prompt behavior documented and tightened so future changes do not regress login flow behavior.

**Why this priority**: The remaining work is mainly behavior hardening and clarity rather than a brand new capability.

**Independent Test**: Review and validate redirect fallback behavior and any prompt gating decisions against the documented rules.

**Acceptance Scenarios**:

1. **Given** redirect handling is reviewed, **When** the fallback path is applied, **Then** it uses the intended safe default instead of deriving from arbitrary current path state.
2. **Given** prompt behavior rules are documented or adjusted, **When** routes change, **Then** Google prompt behavior remains deliberate rather than accidental.

### Edge Cases

- What happens when the redirect query parameter is missing, empty, or malformed?
- What happens when a redirect target is not app-relative?
- What happens when the login page mounts more than once during client-side navigation?
- What happens when the One Tap prompt should be suppressed on certain routes but the SDK is already initialized?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST initialize Google Identity Services once at the app level.
- **FR-002**: The system MUST render the Google sign-in button on login routes when the login UI mounts.
- **FR-003**: The system MUST keep button rendering tied to the login page DOM rather than the app shell.
- **FR-004**: The system MUST keep Google initialization separate from login-button rendering.
- **FR-005**: The system MUST allow the One Tap prompt to appear on eligible pages when the SDK is ready.
- **FR-006**: The system MUST avoid re-initializing Google Identity Services on route changes.
- **FR-007**: The system MUST preserve app-relative redirect targets for successful post-login navigation.
- **FR-008**: The system MUST reject or avoid unsafe non-app-relative redirect targets.
- **FR-009**: The system SHOULD use `/` as the safe post-login fallback when no valid redirect target is present.
- **FR-010**: The project SHOULD document or decide whether prompt behavior needs route-specific gating or suppression.

### Key Entities *(include if feature involves data)*

- **Login Redirect Target**: The app-relative destination requested before the user is sent to login.
- **Google Initialization Context**: The app-level state responsible for loading and initializing Google Identity Services.
- **Login Button Render Target**: The login-page DOM container where the Google button appears.
- **One Tap Eligibility State**: The runtime conditions under which the prompt may appear on a page.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Logged-out users who start from protected routes can complete Google login and land on the intended in-app destination.
- **SC-002**: The Google sign-in button renders on login routes without being mounted in the app shell.
- **SC-003**: Google Identity Services does not re-initialize on ordinary route changes during verification runs.
- **SC-004**: Invalid or missing redirect targets fall back to a safe in-app destination.

## Assumptions

- The current App Router-based implementation remains the baseline.
- Google One Tap and the Google sign-in button remain distinct but coordinated behaviors.
- The feature is focused on behavior correctness, not broader auth-system redesign.
