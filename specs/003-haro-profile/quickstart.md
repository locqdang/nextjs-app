# Quickstart: HARO Profile Page and Gmail Mailbox Connection

## Prerequisites

- Working app auth flow
- A valid JWT-backed logged-in session
- MongoDB access for `profiles` and `mailbox_connections`
- Google OAuth configuration for mailbox routes

## Validate current profile behavior

1. Log in and open `/haro/profile`.
2. Confirm the page shows loading, then either an existing profile or an empty-state form.
3. Edit profile fields and save.
4. Reload the page and confirm persisted values are returned.

## Validate current mailbox connection behavior

1. Start mailbox connection from `/haro/profile`.
2. Complete the Google OAuth flow.
3. Confirm the callback returns to the profile page.
4. Confirm mailbox connected status and connected email metadata appear.
5. Disconnect the mailbox and confirm connection state is cleared.

## Validate remaining polish work

1. Confirm callback success or failure messaging is explicit on the redirected profile page.
2. Review and document the profile source-of-truth decision.
3. Verify production-safe values for `NEXT_PUBLIC_FRONTEND_URL`, `GOOGLE_CALLBACK_URL`, and `GOOGLE_MAILBOX_CALLBACK_URL`.
4. Confirm `.env.local` is excluded from production container inputs.
