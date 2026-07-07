<!--
Sync Impact Report
Version change: template -> 1.0.0
Modified principles:
- Added I. Clarify and Specify Before Coding
- Added II. Verification Plan Before Implementation
- Added III. Test-First When Practical
- Added IV. Contract-and-Flow-First Quality
- Added V. Vietnamese Product, English Build Artifacts
- Added VI. Observable, Reviewable Delivery
Added sections:
- Delivery Constraints
- Workflow and Quality Gates
Removed sections:
- Placeholder principle and section tokens from the default template
Templates reviewed:
- .specify/templates/plan-template.md ✅ updated
- .specify/templates/spec-template.md ✅ updated
- .specify/templates/tasks-template.md ✅ updated
- .specify/templates/constitution-template.md ✅ updated
Follow-up TODOs:
- none
-->
# VietPolyglots Constitution

## Core Principles

### I. Clarify and Specify Before Coding
Every meaningful change MUST start with clarification, a written spec or ticket,
and explicit acceptance criteria before implementation begins. The team MUST not
jump straight from a rough idea to code when requirements, scope boundaries, or
edge cases are still unclear.

### II. Verification Plan Before Implementation
Lead MUST decide the verification plan at spec or planning time. Every
substantial feature or bug fix MUST state what requires unit tests,
integration tests, E2E coverage, and manual smoke checks. Builder executes that
plan and may propose adjustments, but no material reduction in verification is
allowed without updating the plan.

### III. Test-First When Practical
When behavior is clear, stable, and cheaply expressed, Builder SHOULD write the
failing test before production code. This applies especially to pure logic,
validation, transformations, permission rules, API contracts, and reproducible
bugs. Test-first is encouraged, but fake or overly brittle tests MUST NOT be
written simply to satisfy process.

### IV. Contract-and-Flow-First Quality
The project MUST prefer the cheapest reliable proof. Unit tests cover isolated
logic, integration tests cover contracts and cross-component behavior, and E2E
checks cover critical user journeys and regressions that only appear in the
real app. For user-facing web changes, lint/build plus realistic browser or E2E
verification are required before calling the work done.

### V. Vietnamese Product, English Build Artifacts
User-facing copy and experience for VietPolyglots SHOULD default to natural
Vietnamese unless a feature explicitly targets another language. Internal build
artifacts such as specs, plans, tasks, implementation notes, code comments, and
technical docs MUST remain in English unless explicitly requested otherwise.

### VI. Observable, Reviewable Delivery
Changes MUST be easy to verify and easy to review. Builder MUST report exact
commands, outputs, and remaining risk. For production-facing changes, logging,
error visibility, and smoke-testability are required, and Loc gets a review
pause before commit or deploy.

## Delivery Constraints
The default delivery sequence is: clarify, write the ticket or spec, define the
verification plan, implement in small slices, run lint/build, run required
automated tests, run E2E or browser verification for user-facing changes, pause
for review, then deploy and smoke-test. Work that skips one of these gates MUST
explain why.

## Workflow and Quality Gates
Lead owns scope, architecture, and required evidence. Builder owns code,
execution, and proof. Important bugs MUST gain regression coverage at the
cheapest reliable layer. Critical flows such as auth, persistence, major forms,
CMS-backed rendering, and navigation MUST NOT rely on unit tests alone.

## Governance
This constitution governs day-to-day delivery for VietPolyglots and supersedes
informal habits when the two conflict.

- Amendments require a written rationale in the constitution itself.
- Semantic versioning applies to this document: MAJOR for incompatible
  governance changes, MINOR for new or materially expanded principles, PATCH for
  clarification-only edits.
- Every substantial feature plan and implementation review MUST check
  constitution compliance, especially around verification planning and
  user-facing E2E proof.
- If a template or workflow drifts from this constitution, the constitution
  wins and the template must be updated.

**Version**: 1.0.0 | **Ratified**: 2026-07-07 | **Last Amended**: 2026-07-07
