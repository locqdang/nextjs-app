# Implementation Plan: HARO Profile Page and Gmail Mailbox Connection

**Branch**: `003-haro-profile` | **Date**: 2026-07-03 | **Spec**: `specs/003-haro-profile/spec.md`

**Input**: Feature specification from `specs/003-haro-profile/spec.md`

## Summary

Normalize the already-implemented HARO profile and Gmail mailbox connection work into canonical Spec Kit docs, then focus further implementation on the remaining polish items: callback-result UX, profile source-of-truth clarity, legacy mailbox cleanup, and deployment hardening.

## Technical Context

**Language/Version**: JavaScript and TypeScript in an existing Next.js application

**Primary Dependencies**: Next.js app routes and API routes, JWT verification, Google OAuth authorization-code flow, MongoDB profile and mailbox connection collections

**Storage**: MongoDB `profiles` collection for HARO profile data and `mailbox_connections` collection for server-side mailbox OAuth data

**Testing**: Existing app verification flow plus targeted API and UI checks for profile load/save and mailbox connection states

**Target Platform**: Linux-hosted Dockerized web application

**Project Type**: Web application

**Performance Goals**: Reliable authenticated profile load/save and mailbox connect or disconnect flows with clear user feedback and safe deployment configuration

**Constraints**: No client access to raw OAuth tokens, no client-trusted identity for profile access, Google-only mailbox scope for now, no email sending or CRM expansion in this feature

**Scale/Scope**: One authenticated HARO profile page, protected profile API, Gmail mailbox OAuth flow, and follow-up polish for callback UX and operational clarity

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- Keep the feature inside the existing app rather than splitting out a separate backend.
- Preserve secure identity derivation from verified JWTs.
- Treat current implementation as baseline reality and scope new work to remaining gaps rather than rewriting for novelty.
- Verification must cover real load/save/connect/disconnect behavior.

Gate status: Pass.

## Project Structure

### Documentation (this feature)

```text
specs/003-haro-profile/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── haro-profile-api.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── app/haro/profile/
├── pages/api/haro/
└── lib/data/

specs/
```

**Structure Decision**: Keep profile UI in the existing app route tree, mailbox flows in the existing API route tree, and persistence inside current MongoDB collections with documented boundaries.

## Phase 0: Research Summary

Research outcomes are recorded in `specs/003-haro-profile/research.md`. The key decisions are:

- Treat the current implementation as the baseline rather than a future proposal.
- Keep profile access secured by verified JWT identity.
- Continue using `mailbox_connections` for mailbox secrets and `profiles` for profile data.
- Focus new work on callback UX, source-of-truth clarity, deployment hardening, and optional legacy-field cleanup.

## Phase 1: Design Artifacts

- `data-model.md` defines profile, mailbox connection, authorization context, and callback result entities.
- `contracts/haro-profile-api.md` documents protected API and mailbox-flow expectations.
- `quickstart.md` defines verification for current functionality and remaining polish work.

## Phase 2 Preview

Task generation should follow this order:

1. Verify and preserve the current working behavior.
2. Improve callback-result UX on the profile page.
3. Resolve or document the profile source-of-truth decision.
4. Harden deployment and legacy-data cleanup paths.

## Complexity Tracking

No constitution violations currently require justification.
