# Implementation Plan: Google One Tap Behavior and Login Flow

**Branch**: `004-google-one-tap` | **Date**: 2026-07-03 | **Spec**: `specs/004-google-one-tap/spec.md`

**Input**: Feature specification from `specs/004-google-one-tap/spec.md`

## Summary

Normalize the current Google One Tap behavior into canonical Spec Kit docs and focus implementation on preserving app-level initialization, login-page button rendering, safe redirect handling, and any remaining prompt-gating decisions.

## Technical Context

**Language/Version**: JavaScript and TypeScript in an existing Next.js application

**Primary Dependencies**: App shell load path, Google One Tap hook, login client UI, server-side Google auth route

**Storage**: Existing auth/session handling; no new feature-specific storage required

**Testing**: Existing app verification flow plus targeted login redirect and client behavior checks

**Target Platform**: Browser-based web application running in the current app architecture

**Project Type**: Web application

**Performance Goals**: Stable login UX without repeated SDK initialization or broken redirect behavior

**Constraints**: Keep button rendering on login DOM only, keep app-relative redirects only, avoid route-change re-initialization

**Scale/Scope**: One coordinated login behavior across app shell, login UI, and Google auth callback flow

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Preserve current architecture rather than mixing old Pages Router assumptions back in.
- Keep redirect safety explicit.
- Avoid duplicated client initialization logic.

Gate status: Pass.

## Project Structure

### Documentation (this feature)

```text
specs/004-google-one-tap/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── login-flow.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── app/app-shell.tsx
├── app/login/
├── hooks/useGoogleOneTap.js
└── pages/api/auth/google.js
```

**Structure Decision**: Keep initialization in the app shell, rendering in the login client UI, and auth completion in the existing server route.

## Phase 0: Research Summary

- Treat the current App Router implementation as canonical.
- Separate initialization, button rendering, and redirect logic in the docs.
- Prioritize safe redirect handling and prompt behavior clarity.

## Phase 1: Design Artifacts

- `data-model.md` describes redirect targets and runtime client states.
- `contracts/login-flow.md` captures expected client and redirect behavior.
- `quickstart.md` defines login and route verification.

## Phase 2 Preview

1. Verify current initialization and button-rendering separation.
2. Tighten redirect fallback behavior.
3. Decide or document prompt gating rules if needed.
