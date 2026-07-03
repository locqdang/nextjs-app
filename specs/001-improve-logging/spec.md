# Feature Specification: Improve Logging

**Feature Branch**: `001-improve-logging`

**Created**: 2026-07-03

**Status**: Draft

**Input**: Migrated from legacy requirements in `tickets/improve-logging/improve-logging.md`

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Safe production diagnostics (Priority: P1)

As the site operator, I want server-side routes and data helpers to emit structured, safe logs so I can diagnose production failures without exposing secrets.

**Why this priority**: The app already runs in production. Safe structured logging is the minimum slice that improves debugging and closes the highest-risk leakage paths.

**Independent Test**: Trigger representative failures in auth, HARO profile, mailbox, Strapi, and Mongo paths while the app runs in production mode. Verify logs are structured, include route and operation context, and do not contain tokens, magic login links, or raw request bodies.

**Acceptance Scenarios**:

1. **Given** a server-side route throws an error, **When** the logger records the failure, **Then** the log includes safe route context, operation context, and a sanitized error object.
2. **Given** the app runs with `NODE_ENV=production`, **When** email login fallback logic executes, **Then** magic login links are never written to logs.
3. **Given** authenticated requests reach protected APIs, **When** logging includes user context, **Then** production logs use a stable hashed identifier instead of plain email.

---

### User Story 2 - Centralized self-hosted log search (Priority: P2)

As the site operator, I want app container logs collected into a self-hosted logging stack so I can search and review production logs from one place.

**Why this priority**: Structured app logs are much more useful once they are centralized. This delivers the requested Docker-based Loki and Grafana setup without coupling app code to a hosted vendor.

**Independent Test**: Start the app with the logging Compose stack, generate application logs, and confirm they appear in Loki and are queryable in local-only Grafana.

**Acceptance Scenarios**:

1. **Given** the Dockerized app is running, **When** the container writes structured logs to stdout, **Then** the log shipper forwards them to Loki.
2. **Given** Grafana is running locally, **When** the operator opens the configured local URL, **Then** they can query recent app logs without exposing Grafana publicly.
3. **Given** the logging stack is configured, **When** logs age beyond the retention window, **Then** older entries are removed according to the retention policy.

---

### User Story 3 - Lower-noise operational logging (Priority: P3)

As the site operator, I want routine success logs reduced and misleading log messages corrected so signal is easier to find during incidents.

**Why this priority**: This improves day-to-day usability after the logger and log backend exist, but it is less critical than preventing sensitive-data leakage and gaining centralized visibility.

**Independent Test**: Run normal app startup and representative DB operations, then verify routine success events are debug-level or suppressed in production and known misleading messages are corrected.

**Acceptance Scenarios**:

1. **Given** MongoDB connection helpers succeed repeatedly in production, **When** the app logs connection state, **Then** routine success messages are not emitted noisily at normal production levels.
2. **Given** `countDocuments()` fails in HARO data helpers, **When** the error is logged, **Then** the message correctly describes a count failure rather than a delete failure.

### Edge Cases

- What happens when `LOG_HASH_SALT` is missing and user hashing is requested?
- What happens when a thrown error is not an `Error` instance or is missing optional fields such as `code` or `status`?
- What happens when the n8n login fallback path runs in non-production without explicit opt-in to log login links?
- What happens when the Docker log shipper is up before the app container or Loki becomes temporarily unavailable?
- What happens when a route attempts to log nested objects that contain token-like keys deep in the payload?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST provide a centralized server-side logger module with standard debug, info, warn, and error methods.
- **FR-002**: The system MUST emit structured JSON logs in production.
- **FR-003**: The system MUST format server-side errors using safe serialization that includes useful diagnostic fields without dumping full request, response, or third-party config objects.
- **FR-004**: The system MUST prevent logging of magic login links, JWTs, OAuth tokens, encrypted token values, passwords, raw bearer tokens, and full auth/profile/mailbox request bodies.
- **FR-005**: The system MUST block login-link logging in production even if fallback or debug paths execute.
- **FR-006**: The system MUST allow login-link logging only in non-production environments with explicit opt-in.
- **FR-007**: Important server-side API routes and data helpers MUST log route or operation context, including request ID where applicable.
- **FR-008**: When user identity is logged in production, the system MUST use a stable hashed identifier instead of plain email.
- **FR-009**: The system MUST replace important raw `console.*` calls in the specified auth, HARO, mailbox, data, and storage files with the centralized logger.
- **FR-010**: The system MUST reduce noisy routine success logging in production while preserving error-level visibility for failures.
- **FR-011**: The system MUST correct misleading existing log messages that describe the wrong failure type.
- **FR-012**: The system MUST support a self-hosted logging flow where application logs go to stdout and are collected by Docker infrastructure rather than sent directly from app code to the log store.
- **FR-013**: The system MUST provide a local-only Grafana interface for viewing centralized logs.
- **FR-014**: The system MUST retain centralized logs for 30 days.
- **FR-015**: The system MUST document local development logging behavior, production logging behavior, data-safety rules, and the self-hosted logging stack.
- **FR-016**: The system SHOULD include automated verification for sensitive logging behavior where practical.

### Key Entities _(include if feature involves data)_

- **Application Log Event**: A structured server-side log record containing level, timestamp, application context, safe metadata, and optional serialized error details.
- **Request Log Context**: Safe request metadata attached to API logs, such as route, method, operation name, request ID, and hashed user identifier.
- **Redaction Rule Set**: The set of field-matching and serialization rules used to suppress or replace sensitive values before they reach logs.
- **Logging Stack Service**: Infrastructure components that collect, store, and query logs, including the Docker log shipper, Loki, and Grafana.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Operators can trigger representative server-side failures and find structured diagnostic logs for them in the centralized log viewer within 2 minutes.
- **SC-002**: In production-mode verification, zero sampled logs from covered auth and mailbox flows contain magic login links, raw bearer tokens, JWTs, or OAuth token values.
- **SC-003**: Operators can correlate repeated requests from the same authenticated user in production logs without exposing the user’s plain email address.
- **SC-004**: Routine MongoDB connection success events no longer dominate normal production log output during a standard app startup and request cycle.
- **SC-005**: Grafana is reachable only from localhost and not from a public interface in the deployed Docker setup.

## Assumptions

- Existing authentication and protected route flows remain in place; this feature improves observability around them rather than redesigning auth.
- Production continues to run from Docker Compose in this repository.
- The first migration focuses on the listed server-side routes and helpers, not every client-side browser console call.
- The preferred self-hosted stack remains Pino plus Docker stdout collection plus Grafana Alloy, Loki, and Grafana unless implementation discovers a blocker.
- Centralized logs are private to the operator, which allows sanitized production stack traces in server-side logs while still forbidding sensitive payload leakage.
