Title: Build /haro/profile page with Mongo-backed profile editing and Gmail mailbox connection

Summary
Replace the current /haro/profile placeholder with a working HARO profile page that:

- loads the signed-in user’s HARO profile from MongoDB by email
- displays profile fields and current mailbox connection state
- lets the user update their profile info
- lets the user connect a mailbox via Google OAuth so HARO workflows can send email from that mailbox

Context

- /haro/profile currently renders an UnderConstructionPage placeholder at src/app/haro/profile/page.tsx.
- /haro/mailbox is also still a placeholder at src/app/haro/mailbox/page.tsx.
- HARO pitches already look up a profile in the HARO Mongo database by expert_email using the signed-in user email from the JWT at src/pages/api/haro/pitches.js.
- Client auth is already in place via useAuth() and a JWT stored in localStorage.
- Google sign-in already exists for login, but mailbox connection is a different OAuth flow and will need offline Gmail access, consent, token storage, and reconnect/disconnect handling.

Scope

1. Page and UX

- Replace src/app/haro/profile/page.tsx with a real authenticated profile page.
- Show loading, empty-state, success, and error states.
- If no HARO profile exists for the signed-in email, show a clear empty state and allow creating one from the current user info.
- Show mailbox connection status on the same page instead of leaving it as a separate dead-end placeholder.

2. Data loading

- Read the signed-in user from useAuth() on the client.
- Fetch the HARO profile from MongoDB via a protected API route using the current JWT.
- Look up the profile by normalized user email (lowercase), matching the existing HARO pitches flow.
- Return only fields needed by the UI plus mailbox connection metadata.

3. Profile editing

- Add a form for editable HARO profile fields.
- Pre-fill the form from the Mongo document.
- Allow create/update via protected API route(s).
- Persist updatedAt on every save.
- Keep non-editable identity fields separate from editable HARO fields.

4. Mailbox connection

- Add a “Connect Gmail” action on the profile page.
- Implement Google OAuth for mailbox access using an authorization-code flow, not the existing Google One Tap login flow.
- Request the minimum scopes needed for sending email.
- Store connection status and tokens server-side in MongoDB only; never expose refresh tokens to the client.
- Support reconnect and disconnect.
- Show last connected email/account and current connection state in the UI.

5. Security and data model

- Validate the JWT on the API routes.
- Ensure users can only read/update the profile associated with their own email.
- Normalize email before lookup.
- Encrypt or otherwise securely protect stored OAuth refresh tokens before saving them.
- Do not store provider secrets in the client.

Suggested implementation shape

- UI:
  - src/app/haro/profile/page.tsx
  - optional client component for the form if needed
- API:
  - GET /api/haro/profile
  - PUT or POST /api/haro/profile
  - GET /api/haro/mailbox/google/start
  - GET /api/haro/mailbox/google/callback
  - POST /api/haro/mailbox/disconnect
- Data:
  - reuse src/lib/data/haro.js for HARO DB access
  - add helper(s) for profile read/write and mailbox token storage

- expert_email
- name / display name
- company
- bio
- topics / expertise
- location
- website
- connection status fields for Gmail (provider, connected email, connectedAt, disconnectedAt if applicable)

Acceptance criteria

- Visiting /haro/profile while logged in shows a real profile page instead of the under-construction placeholder.
- The page loads the HARO profile by the authenticated user email from MongoDB.
- Existing profile info is displayed and editable.
- Saving changes updates the Mongo record and reflects the changes on reload.
- A user without an existing HARO profile can create one from the page.
- The page shows mailbox connection status.
- A logged-in user can start Google OAuth from /haro/profile and complete the callback successfully.
- OAuth tokens are stored only on the server side and tied to the authenticated user/profile.
- Users cannot fetch or modify another user’s profile or mailbox connection.
- Error states are shown clearly for failed load, failed save, failed OAuth callback, and disconnected mailbox.

Notes / risks

- Existing Google login uses One Tap ID tokens and is not enough for mailbox sending permissions.
- Mailbox connection may deserve its own follow-up ticket for actual send/test-send functionality if you want to keep this one tighter.
- Decide early whether the source of truth is the existing HARO profiles collection keyed by expert_email or a new app-owned profile collection mirrored to HARO.

Out of scope for this ticket

- Sending HARO emails from the mailbox
- Syncing inbox messages
- Non-Google mailbox providers
- Full journalist CRM features
