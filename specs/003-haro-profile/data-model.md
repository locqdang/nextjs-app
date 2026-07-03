# Data Model: HARO Profile Page and Gmail Mailbox Connection

## HARO Profile

Represents the editable app-managed profile record for the authenticated user.

**Fields**
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

**Validation rules**
- Access must be scoped to the verified authenticated user.
- The API should return only UI-needed fields.

## Mailbox Connection

Represents the server-side Google OAuth mailbox connection record.

**Fields**
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

**Validation rules**
- Tokens must remain encrypted at rest.
- Raw token values must never be returned to the client.

## Authorization Context

Represents the verified JWT-derived user identity used for profile and mailbox operations.

**Fields**
- verified user identity
- derived user email
- request authorization state

**Validation rules**
- Client-supplied identity is ignored for profile ownership decisions.

## Mailbox Callback Result

Represents the success or failure state returned from the OAuth callback flow and displayed on the profile page.

**Fields**
- callback status
- user-facing message
- redirect target

**Validation rules**
- Invalid or expired callback state must fail safely.
- User-facing callback messages should be explicit but not expose secrets.
