# Contract: HARO Profile API and Gmail Mailbox Flow

## Protected profile API contract

The app exposes protected profile routes for:

- `GET /api/haro/profile`
- `PUT /api/haro/profile`

### Required behavior

- Requests require a bearer token.
- The server verifies the JWT and derives the user identity from it.
- The server does not trust client-supplied email or identity fields for profile ownership.
- The response returns profile fields needed by the UI plus mailbox display metadata.

## Gmail mailbox flow contract

The app exposes mailbox routes for:

- `GET /api/haro/mailbox/google/start`
- `GET /api/haro/mailbox/google/callback`
- `POST /api/haro/mailbox/disconnect`

### Required behavior

- The start route requires an authenticated user and signs a short-lived state value.
- The callback route verifies the signed state before associating the mailbox with the user.
- Token exchange happens server-side only.
- The client never receives raw OAuth tokens.
- Disconnect clears local mailbox connection state and revokes tokens when possible.

## Follow-up contract expectations

- The redirected profile page should display callback results clearly.
- The project should document which profile store is canonical.
- Deployment-safe callback URL configuration must be explicit.
