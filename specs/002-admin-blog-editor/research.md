# Research: Admin AI-Assisted Blog Editor

## Decision: Reuse the existing JWT verification and MongoDB role lookup for admin authorization

**Rationale**: The repo already stores a JWT client-side and verifies bearer tokens server-side, and the admin role convention already exists in `users.role === 'admin'`. Reusing that path minimizes risk and avoids parallel auth logic.

**Alternatives considered**:
- Client-side role checks only: inadequate for security.
- A separate admin auth system: unnecessary complexity for the current app.

## Decision: Keep admin blog writes and AI-assist calls server-side only

**Rationale**: Strapi tokens and n8n webhook credentials must not reach the browser. Server-side proxy routes preserve secret handling and allow validation, normalization, and safe logging.

**Alternatives considered**:
- Direct browser calls to Strapi or n8n: rejected because they expose credentials and reduce control over validation.

## Decision: Build the manual create and edit flow before wiring the real n8n workflow

**Rationale**: The editor and secure save path are useful on their own and are prerequisites for AI-assisted drafting. Mocking the AI contract first keeps frontend and API work unblocked.

**Alternatives considered**:
- Waiting for a finished n8n workflow first: slows down core app-side delivery.
- Building AI-first before manual editing: weak foundation and poorer testability.

## Decision: Keep v1 scope limited to blog fields already rendered publicly

**Rationale**: The public blog already depends on a stable subset of fields. Restricting v1 to those fields avoids turning the feature into a full CMS replacement.

**Alternatives considered**:
- Immediate support for media library, author management, tag management, and rich publishing workflows: too broad for the first version.

## Decision: Use n8n to return Strapi rich text JSON directly

**Rationale**: Returning already-structured rich text reduces transformation logic in the Next.js app and keeps the app focused on validation and review rather than format conversion.

**Alternatives considered**:
- Markdown or plain text responses that the app converts later: more transformation complexity and more formatting risk.

## Decision: Store `aiChatId` on the Strapi blog post but keep full AI history in n8n

**Rationale**: The editor needs a durable reference to the related AI run, but duplicating full prompt and draft history into app storage is unnecessary in v1.

**Alternatives considered**:
- Duplicating full AI history in MongoDB or Strapi: extra storage and synchronization burden.
