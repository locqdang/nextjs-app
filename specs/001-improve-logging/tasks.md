# Tasks: Improve Logging

## Phase 1: Setup

- [ ] T001 Add the `pino` dependency in `package.json` and update `package-lock.json`
- [ ] T002 Create the feature documentation artifacts under `specs/001-improve-logging/` and keep `tickets/improve-logging/` as compatibility source material

## Phase 2: Foundational

- [ ] T003 Create the centralized logger module in `src/lib/logger.js`
- [ ] T004 [P] Create logger helper tests in `src/tests/lib/logger.test.js`
- [ ] T005 Create request-context logging helpers in `src/lib/api-logging.js`
- [ ] T006 [P] Create request-context tests in `src/tests/lib/api-logging.test.js`

## Phase 3: User Story 1 - Safe production diagnostics

**Goal**: Replace unsafe or inconsistent server-side logging with structured, redacted, context-rich logging.

**Independent Test**: Trigger failures in covered routes and confirm structured logs omit forbidden values while preserving diagnostic context.

- [ ] T007 [US1] Migrate auth email login logging in `src/pages/api/auth/email-login.js`
- [ ] T008 [P] [US1] Migrate Google auth logging in `src/pages/api/auth/google.js`
- [ ] T009 [P] [US1] Migrate login verification logging in `src/pages/api/auth/verify-login.js`
- [ ] T010 [P] [US1] Migrate HARO profile logging in `src/pages/api/haro/profile.js`
- [ ] T011 [P] [US1] Migrate HARO pitches logging in `src/pages/api/haro/pitches.js`
- [ ] T012 [P] [US1] Migrate mailbox start logging in `src/pages/api/haro/mailbox/google/start.js`
- [ ] T013 [P] [US1] Migrate mailbox callback logging in `src/pages/api/haro/mailbox/google/callback.js`
- [ ] T014 [P] [US1] Migrate mailbox disconnect logging in `src/pages/api/haro/mailbox/disconnect.js`
- [ ] T015 [P] [US1] Migrate shared API data logging in `src/pages/api/data.js`
- [ ] T016 [P] [US1] Migrate MongoDB helper logging in `src/lib/data/mongodb.js`
- [ ] T017 [P] [US1] Migrate HARO data helper logging and fix the count-failure message in `src/lib/data/haro.js`
- [ ] T018 [P] [US1] Migrate Strapi helper logging in `src/lib/data/strapi.js`
- [ ] T019 [US1] Run targeted unit and route-level verification for sensitive logging behavior

## Phase 4: User Story 2 - Centralized self-hosted log search

**Goal**: Add a repo-local Docker logging stack that collects app logs and exposes local-only Grafana.

**Independent Test**: Start the app with the logging stack and verify logs appear in Loki and Grafana.

- [ ] T020 [US2] Add app logging labels in `docker-compose.yml`
- [ ] T021 [P] [US2] Create Loki configuration in `infra/logging/loki-config.yaml`
- [ ] T022 [P] [US2] Create Alloy configuration in `infra/logging/alloy/config.alloy`
- [ ] T023 [P] [US2] Create Grafana datasource provisioning in `infra/logging/grafana/provisioning/datasources/loki.yaml`
- [ ] T024 [US2] Create the companion logging stack in `docker-compose.logging.yml`
- [ ] T025 [US2] Validate local-only Grafana binding and end-to-end log ingestion with Docker Compose

## Phase 5: User Story 3 - Lower-noise operational logging

**Goal**: Reduce routine production log noise and improve clarity of operational messages.

**Independent Test**: Run normal startup and request flows and confirm high-volume routine successes are suppressed or downgraded while failures remain visible.

- [ ] T026 [US3] Downgrade or suppress noisy MongoDB success logs in `src/lib/data/mongodb.js`
- [ ] T027 [US3] Review remaining migrated route and helper log levels for noisy production output
- [ ] T028 [US3] Verify corrected operational messages during representative failure simulations

## Final Phase: Polish & Cross-Cutting Concerns

- [ ] T029 Create or update logging operations documentation in `docs/logging.md`
- [ ] T030 [P] Update environment and usage notes in `.env.example` and `README.md`
- [ ] T031 [P] Update CI or deployment workflow references in `.github/workflows/ci.yml` and `.github/workflows/cd.yml` if needed for the logging stack files
- [ ] T032 Run final validation commands and capture the working verification steps in `specs/001-improve-logging/quickstart.md`

## Dependencies

- Finish Phase 1 before Phase 2.
- Finish Phase 2 before any user story phases.
- User Story 1 should land before User Story 2 so centralized storage receives already-safe structured logs.
- User Story 3 depends on User Story 1 because noise reduction happens after migration to the centralized logger.

## Parallel opportunities

- T004 and T006 can be developed in parallel with helper implementation once interfaces are agreed.
- Within User Story 1, route and helper migrations marked `[P]` can be split across independent files.
- Within User Story 2, Loki, Alloy, and Grafana provisioning files can be created in parallel.

## Implementation strategy

- MVP: Complete User Story 1 first for immediate safety and diagnostic value.
- Next increment: Add the Docker logging stack in User Story 2.
- Final increment: Tune noise levels and finish operational polish in User Story 3.
