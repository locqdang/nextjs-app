Title: HARO profile page with protected profile API and Gmail mailbox connection

Status

Partially complete. The core /haro/profile page, protected profile API, and Gmail mailbox connect/disconnect flow are now implemented. This ticket has been updated from a forward-looking spec into an implementation/status ticket so it matches the current codebase.

What is implemented

1. Page and UX

- `/haro/profile` is no longer a placeholder.
- `src/app/haro/profile/page.tsx` renders a working profile experience through `HaroProfileClient`.
- The profile page now shows:
  - loading state
  - empty/new-profile state
  - success and error messages
  - mailbox connection status
  - profile summary
  - editable HARO profile form
- Mailbox connect/reconnect/disconnect actions are exposed directly on the profile page.

2. Protected profile API

Implemented route:

- `GET /api/haro/profile`
- `PUT /api/haro/profile`

Current behavior:

- requires Bearer token
- verifies JWT server-side
- derives the user email from the verified JWT only
- never trusts client-supplied email for profile lookup
- loads profile data from MongoDB `profiles` by `expert_email`
- saves profile data back to the same `profiles` collection
- returns only UI-needed fields plus mailbox metadata
- returns allowed expertise values for the client form

Current profile fields mapped in the API/client:

- `firstName`
- `lastName`
- `email`
- `company`
- `companyNiche`
- `website`
- `jobTitle`
- `bio`
- `expertise`
- `linkedinUrl`
- `headshotUrl`
- `signature`
- `status`

3. Gmail mailbox OAuth flow

Implemented routes:

- `GET /api/haro/mailbox/google/start`
- `GET /api/haro/mailbox/google/callback`
- `POST /api/haro/mailbox/disconnect`

Current behavior:

- mailbox connection uses Google OAuth authorization-code flow
- this is separate from Google One Tap login
- start route requires Bearer token and signs a short-lived JWT `state`
- callback route verifies the signed `state` to recover the authenticated app user identity
- callback exchanges Google code for tokens server-side
- callback fetches the connected Google account email from Google token info
- disconnect route revokes Google token when possible and clears local connection state

Scopes currently requested:

- `openid`
- `email`
- `profile`
- `https://www.googleapis.com/auth/gmail.send`

4. Mailbox token storage

Current architecture:

- mailbox OAuth data is stored in MongoDB collection: `mailbox_connections`
- mailbox tokens are no longer stored on `profiles`
- profile read API joins mailbox display state from `mailbox_connections`

Current mailbox connection fields:

- `owner_email`
- `provider`
- `status`
- `connected_email`
- `connected_at`
- `disconnected_at`
- `access_token_enc`
- `refresh_token_enc`
- `token_scope`
- `token_type`
- `expiry_date`
- `createdAt`
- `updatedAt`

Security details:

- refresh/access tokens are stored server-side only
- tokens are encrypted before storage
- encryption uses `MAILBOX_TOKEN_ENCRYPTION_KEY` or falls back to `JWT_SECRET`
- client never receives raw OAuth tokens

5. Client implementation notes

Current client file:

- `src/app/haro/profile/HaroProfileClient.tsx`

Current client behavior:

- loads profile via `/api/haro/profile`
- saves profile via `/api/haro/profile`
- starts mailbox OAuth via `/api/haro/mailbox/google/start`
- disconnects mailbox via `/api/haro/mailbox/disconnect`
- reads JWT from `localStorage` and sends it in the `Authorization` header as a Bearer token
- shows mailbox connected/disconnected state and connected email/time

Architecture decisions made

- keep the feature inside the Next.js app instead of creating a separate backend service
- protect private profile access through Next.js API routes with JWT verification
- derive user identity from the verified JWT, not from query params or form input
- store mailbox secrets in a dedicated `mailbox_connections` collection
- keep profile data in `profiles`

What changed from the original ticket assumptions

- `/haro/profile` was not actually a placeholder anymore by the time implementation work started; the ticket was stale on that point
- implementation uses a protected app-owned profile API instead of exposing the upstream HARO dataset directly to the browser
- mailbox token storage moved out of `profiles` into `mailbox_connections`
- `/haro/mailbox` remains outside the main workflow because mailbox management is now handled inside `/haro/profile`

Known gaps / follow-up work

1. Callback result UX on `/haro/profile`

Still needs polish:

- read and display `?mailbox=...&message=...` callback params more explicitly after redirect
- optionally clear query params after showing the message

2. Source-of-truth decision

Still needs a project decision:

- current `/api/haro/profile` reads/writes the app Mongo `profiles` collection
- it does not currently proxy or sync with `http://192.168.0.62:3000/haro-profiles`
- decide whether:
  - app Mongo `profiles` is the canonical source of truth, or
  - `/api/haro/profile` should become a secure server-side proxy/sync layer to the upstream HARO service

3. Legacy mailbox field cleanup

Still open:

- if any old mailbox fields were previously stored on `profiles`, they have not been migrated/cleaned automatically by this ticket
- follow-up migration may be needed to move any legacy mailbox data into `mailbox_connections`

4. Deployment/env hardening

Still important operationally:

- production callback redirects depend on `NEXT_PUBLIC_FRONTEND_URL`
- `.env.local` must not be copied into production images/containers
- Docker builds should exclude `.env.local` via `.dockerignore`
- production must use production-safe env values for:
  - `NEXT_PUBLIC_FRONTEND_URL`
  - `GOOGLE_CALLBACK_URL`
  - `GOOGLE_MAILBOX_CALLBACK_URL`

5. Mail sending functionality

Still out of scope here:

- actually sending HARO emails through the connected mailbox
- send/test-send workflows
- inbox sync
- non-Google providers

Acceptance criteria status

- Visiting `/haro/profile` while logged in shows a real profile page instead of a placeholder. ✅
- The page loads the HARO profile by authenticated user email through a protected API route. ✅
- Existing profile info is displayed and editable. ✅
- Saving changes updates the Mongo record and reflects on reload. ✅
- A user without an existing HARO profile can create one from the page. ✅
- The page shows mailbox connection status. ✅
- A logged-in user can start Google OAuth from `/haro/profile` and complete the callback successfully. ✅
- OAuth tokens are stored only on the server side and tied to the authenticated user/profile. ✅
- Users cannot fetch or modify another user’s profile or mailbox connection via client-supplied identity. ✅
- Error states are shown for failed load/save/connect/disconnect paths. Mostly complete; callback-result UX can still be improved. ◑

Relevant files

- `src/app/haro/profile/page.tsx`
- `src/app/haro/profile/HaroProfileClient.tsx`
- `src/pages/api/haro/profile.js`
- `src/pages/api/haro/mailbox/google/start.js`
- `src/pages/api/haro/mailbox/google/callback.js`
- `src/pages/api/haro/mailbox/disconnect.js`
- `src/lib/data/haro.js`

Out of scope

- Sending HARO emails from the mailbox
- Syncing inbox messages
- Non-Google mailbox providers
- Full journalist CRM features
