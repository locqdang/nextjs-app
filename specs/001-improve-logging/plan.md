# Implementation Plan: Improve Logging

**Branch**: `001-improve-logging` | **Date**: 2026-07-03 | **Spec**: `specs/001-improve-logging/spec.md`

**Input**: Feature specification from `specs/001-improve-logging/spec.md`

## Summary

Introduce a centralized server-side logger for the Next.js app, migrate critical route and data-helper logging to that logger, and add a self-hosted Docker logging stack that collects container stdout into Loki with local-only Grafana for querying.

## Technical Context

**Language/Version**: JavaScript and TypeScript in a Next.js application running on Node.js

**Primary Dependencies**: Next.js, existing auth and data helpers, Pino for application logging, Docker Compose, Grafana Alloy, Grafana Loki, Grafana

**Storage**: Existing MongoDB and Strapi integrations for application data; Loki storage for centralized logs

**Testing**: Existing repo test workflow plus targeted unit and verification tests for logger helpers and sensitive logging behavior

**Target Platform**: Linux Docker host running the production Compose stack

**Project Type**: Web application

**Performance Goals**: Improve production diagnostics without materially increasing request latency or flooding logs with low-value success messages

**Constraints**: No logging of secrets or full sensitive payloads, no direct app-to-Loki coupling, Grafana must remain local-only, retain logs for 30 days

**Scale/Scope**: Current app server routes and data helpers listed in the migrated spec, plus one companion Docker logging stack in this repo

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Keep changes incremental and repo-local rather than introducing a separate backend service.
- Prefer reversible infrastructure additions that do not block normal CI or local app development.
- Protect sensitive user and auth data by design.
- Verification must include real execution of tests and logging-stack checks where practical.

Gate status: Pass.

## Project Structure

### Documentation (this feature)

```text
specs/001-improve-logging/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── observability.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── app/
├── lib/
│   ├── data/
│   └── logger.js
├── pages/
│   └── api/
└── tests/

infra/
└── logging/
    ├── alloy/
    ├── grafana/
    └── loki/

specs/
└── 001-improve-logging/

docker-compose.yml
docker-compose.logging.yml
docs/
```

**Structure Decision**: Keep the feature in the existing single Next.js project and add a companion `infra/logging/` tree plus `docker-compose.logging.yml` for the self-hosted logging stack.

## Phase 0: Research Summary

Research outcomes are recorded in `specs/001-improve-logging/research.md`. The key decisions are:
- Use Pino for structured application logging.
- Emit logs to stdout and collect them from Docker rather than sending logs from app code to Loki.
- Use Grafana Alloy as the shipper, Loki as the log store, and Grafana as the local-only query UI.
- Use hashed user identity and explicit redaction rules to prevent sensitive-data leakage.

## Phase 1: Design Artifacts

- `data-model.md` defines the log event, request context, redaction rules, and infrastructure entities.
- `contracts/observability.md` documents the expected logger API and infrastructure-level log flow.
- `quickstart.md` defines validation steps for local and production-style verification.

## Phase 2 Preview

Task generation should follow this order:
1. Add logger dependency and helper module.
2. Add tests for error serialization, redaction, request context, and login-link gating.
3. Migrate the listed route and data-helper files to the logger.
4. Add Docker logging stack files and labels.
5. Document operations and run verification.

## Complexity Tracking

No constitution violations currently require justification.
