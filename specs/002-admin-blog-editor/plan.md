# Implementation Plan: Admin AI-Assisted Blog Editor

**Branch**: `002-admin-blog-editor` | **Date**: 2026-07-03 | **Spec**: `specs/002-admin-blog-editor/spec.md`

**Input**: Feature specification from `specs/002-admin-blog-editor/spec.md`

## Summary

Add a protected admin blog management area to the existing Next.js app so admins can list, create, edit, and publish Strapi-backed blog posts, then extend that flow with a server-side n8n draft-assist integration that keeps secrets on the server and requires manual review before save.

## Technical Context

**Language/Version**: JavaScript and TypeScript in an existing Next.js application

**Primary Dependencies**: Next.js App Router for admin UI pages, Next Pages API routes for server endpoints, existing JWT verification flow, MongoDB user-role lookup, Strapi blog data integration, n8n webhook integration

**Storage**: Strapi for blog posts, MongoDB for user and role lookup, n8n-side storage for AI prompt and draft history

**Testing**: Existing repo test workflow plus targeted unit and API tests for authorization, validation, AI-response handling, and failure paths

**Target Platform**: Linux-hosted Dockerized web application

**Project Type**: Web application

**Performance Goals**: Admin blog list, create, update, and AI-assist flows should be responsive for normal editorial use without exposing private credentials or oversized request handling problems

**Constraints**: Do not expose Strapi or n8n secrets to the browser, do not trust client-side role state, do not auto-publish AI output, keep v1 scope away from full media and CMS replacement features

**Scale/Scope**: One protected admin blog feature covering the listed UI routes, admin API routes, Strapi write path, and the first `draft_from_prompt` AI action

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Reuse existing auth, logging, and data-access conventions instead of inventing a parallel admin stack.
- Keep the feature small enough for incremental validation: manual editor first, AI assist second.
- Preserve production safety by design for credentials, authorization, and unpublished content.
- Verification must include real tests and flow checks after implementation.

Gate status: Pass.

## Project Structure

### Documentation (this feature)

```text
specs/002-admin-blog-editor/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── blog-ai-assist.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── app/
│   └── admin/
├── lib/
│   ├── data/
│   └── blog-posts.js
├── pages/
│   └── api/admin/blog/
└── tests/

docs/
specs/
```

**Structure Decision**: Keep admin UI in the existing app route tree and implement server endpoints in the existing Next Pages API style so the feature matches the project’s current structure and auth patterns.

## Phase 0: Research Summary

Research outcomes are recorded in `specs/002-admin-blog-editor/research.md`. The key decisions are:
- Reuse JWT verification and MongoDB role checks for admin authorization.
- Keep Strapi writes and n8n integration server-side only.
- Use mocked n8n responses first, then connect to the real webhook after the contract is stable.
- Keep v1 focused on core blog fields already rendered publicly.

## Phase 1: Design Artifacts

- `data-model.md` defines admin blog post payloads, AI request and response shapes, and authorization context.
- `contracts/blog-ai-assist.md` documents the server-side AI assist contract and admin API expectations.
- `quickstart.md` defines validation steps for admin access, manual publishing, AI-assisted drafting, and public blog verification.

## Phase 2 Preview

Task generation should follow this order:
1. Add admin authorization and payload-validation helpers.
2. Build list, create, and edit API routes plus the basic admin UI.
3. Add mocked AI-assist contract and editor integration.
4. Connect the real n8n webhook and complete verification.
5. Add documentation and operational tests.

## Complexity Tracking

No constitution violations currently require justification.
