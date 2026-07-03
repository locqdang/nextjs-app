# Implementation Plan: New Menus and HARO Navigation

**Branch**: `005-new-menus` | **Date**: 2026-07-03 | **Spec**: `specs/005-new-menus/spec.md`

**Input**: Feature specification from `specs/005-new-menus/spec.md`

## Summary

Normalize the navigation redesign into canonical Spec Kit docs and focus implementation on separating global public and account navigation, adding HARO contextual desktop navigation, and keeping HARO mobile navigation simple with a local section switcher.

## Technical Context

**Language/Version**: JavaScript and TypeScript in an existing Next.js application

**Primary Dependencies**: Existing navbar component, global styles, HARO route context, auth state for account actions

**Storage**: Existing auth/session state only; no new dedicated storage required

**Testing**: Existing app verification flow plus targeted desktop and mobile navigation checks

**Target Platform**: Responsive web application

**Project Type**: Web application

**Performance Goals**: Clear navigation behavior across desktop and mobile without confusing route-context transitions

**Constraints**: Keep mobile simpler than desktop, preserve global access while inside HARO, avoid overloading the mobile header

**Scale/Scope**: Navbar behavior, account menu behavior, HARO contextual desktop navigation, and mobile HARO section switching

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- Keep the redesign grounded in the existing navbar component and route context.
- Optimize for clarity over cleverness.
- Treat desktop HARO and mobile HARO as intentionally different UX patterns.

Gate status: Pass.

## Project Structure

### Documentation (this feature)

```text
specs/005-new-menus/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── navigation-behavior.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── components/Navbar.js
├── styles/globals.css
└── app/haro/
```

**Structure Decision**: Keep the redesign centered on the existing navbar component and style system, with route-aware behavior for HARO context.

## Phase 0: Research Summary

- Use a two-group global navbar outside HARO.
- Use contextual left-side navigation on desktop inside HARO.
- Keep mobile HARO navigation local and compact rather than global-header heavy.

## Phase 1: Design Artifacts

- `data-model.md` describes the navigation states and context switches.
- `contracts/navigation-behavior.md` defines expected desktop and mobile behavior.
- `quickstart.md` defines route-by-route verification.

## Phase 2 Preview

1. Verify baseline navbar and auth-state behavior.
2. Implement non-HARO two-group navigation.
3. Implement HARO desktop contextual nav.
4. Implement HARO mobile local switcher.
5. Resolve remaining follow-up decisions.
