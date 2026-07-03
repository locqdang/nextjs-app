# Research: HARO Profile Page and Gmail Mailbox Connection

## Decision: Keep the feature inside the existing Next.js app

**Rationale**: The current implementation already works within the app using protected API routes and app pages. Splitting it into a separate backend would add complexity without solving a demonstrated problem in the current scope.

**Alternatives considered**:

- Separate backend service for profile and mailbox operations: rejected for unnecessary complexity.

## Decision: Derive identity from the verified JWT only

**Rationale**: The current implementation correctly avoids trusting client-supplied email or identity fields. This is the right security boundary for profile and mailbox operations.

**Alternatives considered**:

- Query-parameter or form-based identity selection: insecure.

## Decision: Keep mailbox OAuth data in `mailbox_connections`

**Rationale**: Moving mailbox secrets out of `profiles` isolates more sensitive token material into a dedicated server-side collection and matches the current architecture.

**Alternatives considered**:

- Storing mailbox tokens directly on profile documents: weaker separation and harder to reason about.

## Decision: Treat the current `profiles` collection as the effective source of truth until a formal project decision changes it

**Rationale**: The live implementation already reads and writes there. Until an upstream sync or proxy layer is actually chosen and built, the docs should reflect operational reality.

**Alternatives considered**:

- Pretending an upstream HARO service is already authoritative: inaccurate.
- Immediate rewrite to a sync or proxy model: outside the current migration and polish scope.

## Decision: Keep mailbox management embedded in `/haro/profile`

**Rationale**: The current flow already exposes connect, reconnect, and disconnect actions directly on the profile page, which keeps the user journey simple.

**Alternatives considered**:

- Restoring a separate `/haro/mailbox` workflow: unnecessary in the current feature scope.

## Decision: Prioritize callback-result UX and deployment hardening as the next implementation gaps

**Rationale**: The core feature is already working. The most useful next improvements are clearer post-OAuth messaging and safer deployment conventions.

**Alternatives considered**:

- Expanding immediately into email sending or CRM scope: explicitly out of scope.
