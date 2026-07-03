# Feature Specification: HARO Profile Page and Gmail Mailbox Connection

**Feature Branch**: `003-haro-profile`

**Created**: 2026-07-03

**Status**: Partially Complete

**Input**: Migrated from legacy implementation/status notes in `tickets/haro-profile.md`

## User Scenarios & Testing *(mandatory)*

### User Story 1 - User manages their HARO profile securely (Priority: P1)

As an authenticated user, I want to load and edit my HARO profile through a protected page so I can maintain my profile information without exposing private data or relying on client-supplied identity.

**Why this priority**: The protected profile page and API are the core of the feature and already deliver user value today.

**Independent Test**: Log in, open `/haro/profile`, load an existing or empty profile, edit fields, save changes, and reload to confirm persistence.

**Acceptance Scenarios**:

1. **Given** an authenticated user opens `/haro/profile`, **When** the page loads, **Then** it fetches that user’s profile through a protected API using the verified JWT identity.
2. **Given** a user updates valid profile fields, **When** the save request succeeds, **Then** the profile data is persisted and shown correctly on reload.
3. **Given** a request attempts to fetch or update another user’s profile through client-supplied identity, **When** the API authorizes the request, **Then** the request is denied or ignored in favor of the verified JWT identity.

---

### User Story 2 - User connects and disconnects a Gmail mailbox safely (Priority: P2)

As an authenticated user, I want to connect or disconnect my Gmail mailbox from the HARO profile page so I can authorize outbound mailbox use without exposing OAuth tokens to the browser.

**Why this priority**: Mailbox connection is a critical adjacent capability for HARO workflows and is already largely implemented.

**Independent Test**: Start mailbox connection from `/haro/profile`, complete the Google OAuth callback, confirm mailbox status appears on the page, then disconnect and confirm the local connection state is cleared.

**Acceptance Scenarios**:

1. **Given** an authenticated user starts mailbox connection, **When** the start route runs, **Then** the app creates a signed state and redirects into the Google OAuth flow.
2. **Given** Google returns a valid callback, **When** the server processes it, **Then** the app stores encrypted mailbox tokens server-side and associates the connection with the authenticated user.
3. **Given** a connected user disconnects the mailbox, **When** the disconnect flow completes, **Then** the local mailbox connection state is cleared and tokens are no longer exposed to client code.

---

### User Story 3 - Operator gets polished callback UX and clear data boundaries (Priority: P3)

As the site operator, I want the mailbox callback results, data source boundaries, and deployment hardening cleaned up so the feature is easier to operate and safer to maintain.

**Why this priority**: The feature already works, but the remaining follow-up items affect clarity, maintainability, and deployment confidence.

**Independent Test**: Complete a mailbox callback and confirm the profile page shows the callback result clearly, then review the chosen profile source-of-truth and deployment hardening changes against the documented behavior.

**Acceptance Scenarios**:

1. **Given** a mailbox OAuth callback redirects back to `/haro/profile`, **When** the page loads after redirect, **Then** the user sees a clear success or failure message derived from callback parameters.
2. **Given** the project chooses a canonical profile data source, **When** the profile API is documented or updated, **Then** operators can tell whether app Mongo or an upstream HARO service is authoritative.
3. **Given** the feature is prepared for deployment, **When** environment and container settings are reviewed, **Then** production-safe callback URLs and `.env.local` handling are documented and enforced.

### Edge Cases

- What happens when a logged-in user has no existing HARO profile record yet?
- What happens when the OAuth callback returns with an invalid, expired, or missing signed `state` value?
- What happens when the connected Google account email differs from the app user’s email?
- What happens when legacy mailbox-related fields still exist on `profiles` after the newer `mailbox_connections` model is in use?
- What happens when callback query parameters remain in the URL after the result has already been shown?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a working `/haro/profile` page for authenticated users.
- **FR-002**: The system MUST provide protected `GET /api/haro/profile` and `PUT /api/haro/profile` routes.
- **FR-003**: The profile API MUST require a bearer token and MUST derive user identity from the verified JWT rather than client-supplied identity fields.
- **FR-004**: The system MUST load and save HARO profile data in the app-managed `profiles` collection unless and until a different source-of-truth decision is adopted.
- **FR-005**: The profile API MUST return only UI-needed fields plus mailbox display metadata.
- **FR-006**: The profile page MUST support empty-state, loading, success, and error states.
- **FR-007**: The system MUST provide Gmail mailbox connection start, callback, and disconnect routes.
- **FR-008**: The mailbox OAuth flow MUST store access and refresh tokens server-side only.
- **FR-009**: The system MUST encrypt stored mailbox tokens.
- **FR-010**: The system MUST keep mailbox OAuth data in the `mailbox_connections` collection rather than on `profiles`.
- **FR-011**: The client MUST never receive raw OAuth tokens.
- **FR-012**: The profile page MUST show mailbox connected or disconnected status and relevant mailbox display metadata.
- **FR-013**: The system SHOULD show callback success or failure results more explicitly on `/haro/profile` after redirect.
- **FR-014**: The project MUST document or decide the canonical source of truth for HARO profile data.
- **FR-015**: The project SHOULD provide a cleanup or migration path for any legacy mailbox fields previously stored on `profiles`.
- **FR-016**: The project MUST document production-safe callback and frontend URL environment requirements.
- **FR-017**: The feature MUST keep actual email sending, inbox sync, non-Google providers, and broader CRM functionality out of scope for this work.

### Key Entities *(include if feature involves data)*

- **HARO Profile**: The app-managed profile record keyed by authenticated user identity and containing editable user-facing HARO profile fields.
- **Mailbox Connection**: The server-side OAuth connection record that stores encrypted token material, connected mailbox identity, provider metadata, status, and timestamps.
- **Authorization Context**: The verified JWT-derived identity used to authorize profile and mailbox operations.
- **Mailbox Callback Result**: The success or failure state returned from the OAuth callback flow and surfaced to the profile page.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Authenticated users can load, create, and update their HARO profile through `/haro/profile` without relying on client-supplied identity.
- **SC-002**: In verification runs, users cannot use the client to fetch or modify another user’s HARO profile or mailbox connection.
- **SC-003**: Users can complete Gmail mailbox connect and disconnect flows without raw OAuth tokens appearing in the browser.
- **SC-004**: After callback UX polish, users can understand mailbox connection success or failure from the redirected profile page without needing manual log inspection.
- **SC-005**: Operators can state clearly which system is the canonical source of HARO profile truth and which environment variables are required for safe production deployment.

## Assumptions

- The current Next.js page, API route, and mailbox flow implementations remain the baseline rather than being replaced by a separate backend service.
- The existing `profiles` collection is the effective source of truth until a deliberate sync or proxy decision is made.
- Google is the only mailbox provider in scope for this feature.
- Mailbox management remains embedded in `/haro/profile` rather than moving to a separate mailbox management page in the current scope.
