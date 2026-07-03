# Improve Logging

## Context

The project currently uses scattered `console.log`, `console.warn`, and `console.error` calls across API routes, data helpers, client components, and scripts.

Current gaps:

- no structured logger
- no consistent log levels
- no request context/request ID
- no central log destination
- some sensitive logs are possible if fallback/dev paths run, especially magic login links in `email-login.js`; production currently has `N8N_LOGIN_WEBHOOK_URL` set in `.env`, but the fallback should still be guarded so it cannot leak in production
- some production logs may be noisy, especially repeated MongoDB connection success logs
- at least one misleading log message exists in `src/lib/data/haro.js` where `countDocuments()` logs an error as a delete failure

The goal is to improve production debugging and security without overbuilding the system.

## Goal

Add a proper logging system to `vietpolyglots.com` using a production-ready JavaScript logging package and a self-hosted log backend.

Confirmed deployment context:

- production currently runs on this computer in Docker
- this ticket should include the full self-hosted logging setup immediately, not only the app logger

Chosen direction:

- application logger: `pino`
- self-hosted log storage/viewing: Grafana Loki + Grafana
- Docker log shipping into Loki

## Proposed Architecture

Use `pino` inside the Next.js app as the structured logger.

Use self-hosted Grafana Loki as the central log store.

Preferred production flow:

```txt
Next.js app -> structured JSON logs -> container/server stdout -> log shipper -> Loki -> Grafana
```

This keeps the app simple and avoids coupling application code directly to one hosted vendor.

Possible log shippers:

- Promtail, if running Docker/VPS style deployment
- Grafana Alloy, if using newer Grafana agent tooling
- Docker logging driver/plugin, if preferred later

## Requirements

### 1. Add application logger

Create a centralized logger module, likely:

```txt
src/lib/logger.js
```

The logger should expose at least:

- `logger.debug()`
- `logger.info()`
- `logger.warn()`
- `logger.error()`

The logger should output structured JSON logs in production.

In local development, readable logs are acceptable if configured safely.

### 2. Use safe error formatting

Error logs should include useful details without dumping dangerous objects.

Allowed error fields:

- `message`
- `name`
- `code`
- `status`
- stack trace for server-side error-level logs in development/staging
- stack trace for production server-side error logs only after redaction/safe serialization

Stack trace decision:

- do not send stack traces in API responses to users
- include stack traces in local development logs
- include sanitized stack traces in production error logs because this app is self-hosted and the logs are private to the operator
- never log full request objects, response objects, headers, bearer tokens, OAuth tokens, or third-party client config objects just to get stack traces

Rationale:

- stack traces are very useful when debugging production failures
- the risky part is not the stack trace itself, but dumping surrounding objects that may contain secrets
- safe serialization gives debugging value without exposing tokens or full request payloads

Avoid logging full third-party response/config objects if they may contain secrets.

### 3. Avoid sensitive data in logs

Do not log:

- magic login links
- JWTs
- OAuth access tokens
- OAuth refresh tokens
- encrypted token values
- passwords
- full email bodies
- full HARO signatures/profile bios unless explicitly needed
- full request bodies for auth/profile/mailbox routes

Magic login links should never be logged in production, even if the n8n webhook fallback path is accidentally reached.

Production currently has `N8N_LOGIN_WEBHOOK_URL` configured in `.env`, so the normal production path should send the login link through n8n. The logging requirement is defensive: the fallback path should still be impossible to leak secrets in production.

Environment behavior:

- Docker production runs with `NODE_ENV=production`.
- Local development runs with `NODE_ENV=development`.
- Therefore, fallback login-link logging must be blocked when `NODE_ENV=production`.

If login-link logging is still needed for local development or tests, it should require an explicit safe condition. Recommended rule:

```txt
NODE_ENV !== 'production' && LOG_LOGIN_LINKS=1
```

This means local development can opt in, but production cannot accidentally print magic login links even if the webhook URL is unavailable.

### 4. Add request context for API routes

API route logs should include safe context such as:

- route name/path
- HTTP method
- operation name
- request ID
- hashed authenticated user email when useful
- status/failure category

Do not log the raw bearer token.
Do not log plain user email by default.

User identity decision:

- use a stable hashed email for production logs, for example `userHash`
- optionally include masked email in local development only if it helps debugging
- avoid plain email in production logs because emails are personal data and are not usually needed to debug route failures

Rationale:

- hashed email lets us correlate logs for the same user across requests
- it avoids exposing plain email addresses in Grafana/Loki
- if a user reports an issue, we can hash their email locally and search by the hash

### 5. Replace important raw console logs

Replace raw `console.*` calls in important server-side files first:

- `src/pages/api/auth/email-login.js`
- `src/pages/api/auth/google.js`
- `src/pages/api/auth/verify-login.js`
- `src/pages/api/haro/profile.js`
- `src/pages/api/haro/pitches.js`
- `src/pages/api/haro/mailbox/google/start.js`
- `src/pages/api/haro/mailbox/google/callback.js`
- `src/pages/api/haro/mailbox/disconnect.js`
- `src/pages/api/data.js`
- `src/lib/data/mongodb.js`
- `src/lib/data/haro.js`
- `src/lib/data/strapi.js`

Client-side logs can be handled separately and should not send private data to server logs.

### 6. Reduce noisy production logs

MongoDB successful connection logs should not appear repeatedly in production unless debug logging is enabled.

Examples that should likely become debug-level logs:

- `✓ MongoDB already connected`
- `✓ Connected to MongoDB: ...`
- `✓ MongoDB connection closed`

DB operation failures should remain error-level logs.

### 7. Fix misleading log message

In `src/lib/data/haro.js`, `countDocuments()` currently logs a delete error on count failure.

Change it to a count-specific message.

### 8. Self-hosted log backend documentation

Add documentation for how logs are expected to be stored/viewed in a self-hosted setup.

Possible file:

```txt
docs/logging.md
```

The docs should explain:

- local development logging
- production logging
- how app logs reach Loki
- what not to log
- basic Grafana/Loki setup notes

If Docker Compose is used for self-hosting, add or document a minimal compose setup for:

- Loki
- Grafana
- log shipper

Because production runs on this computer in Docker, this ticket should include Docker Compose configuration or a clearly documented companion Compose stack for the logging services.

The logging stack should be able to collect logs from the running `vietpolyglots.com` app container without requiring the app to manually send HTTP requests to Loki from application code.

## Out of Scope

- Full metrics/monitoring system
- Distributed tracing
- Alerting rules
- Business analytics/event tracking
- Logging every user action
- Replacing all client-side console logs in the first pass
- Sending logs to a SaaS-only provider

## Acceptance Criteria

- A centralized logger module exists and is used by the main server-side API/data files.
- Logs are structured in production.
- Important API failures include safe route/operation context.
- Magic login links are not logged in production.
- OAuth/JWT/token values are not logged.
- MongoDB connection success logs are not noisy in production.
- `countDocuments()` has a correct count-specific error log message.
- Basic tests or verification exist for sensitive logging behavior where practical.
- Documentation explains the chosen self-hosted logging backend and how to view logs.

## Test Plan

### Unit tests where practical

Add tests for logger helper behavior if the implementation creates functions such as:

- safe error serialization
- sensitive field redaction
- request ID generation/context helpers

Possible test targets:

```txt
src/tests/lib/logger.test.js
```

### API/integration checks

Where practical, verify that:

- auth/email login does not print magic links in production mode
- API route failures call the logger with route/operation context
- token-like fields are not included in serialized log metadata

### Manual verification

Run the app locally and trigger:

- failed login
- failed HARO profile request
- failed mailbox disconnect/revoke path if safely mockable
- failed Strapi/Mongo fetch path if safely mockable

Confirm logs are readable locally and structured in production mode.

If Loki/Grafana is configured, confirm logs appear in Grafana with useful labels.

## Decisions

1. Production currently runs on this computer in Docker.
2. The production Docker Compose setup is under this repo: `~/projects/vietpolyglots.com/`.
3. This ticket includes the full self-hosted setup immediately: Pino app logging plus Loki/Grafana/log shipping.
4. Use Grafana Loki + Grafana as the self-hosted log backend unless implementation research finds a strong blocker.
5. Grafana should be local-only, not exposed publicly through a domain/reverse proxy.
6. Keep logs for 30 days.
7. Keep the logging stack inside this repo, not under `/home/loc/dockers/`.
8. Use hashed email/user identity in production logs. Do not log plain email by default.
9. Include sanitized stack traces in production server-side error logs, but never expose stack traces in API responses.
10. Implement the full setup, not a logger-only first pass.

## Remaining Open Questions

None for the requirement phase. Next step is design.

## Recommended First Implementation Slice

1. Add `pino`.
2. Create `src/lib/logger.js` with safe error formatting and redaction.
3. Replace logging in `src/pages/api/auth/email-login.js` first to guard magic-link fallback logging and route webhook errors through the logger.
4. Replace logging in HARO mailbox/profile routes.
5. Replace logging in Mongo/HARO/Strapi data helpers.
6. Add tests for safe logger behavior.
7. Add `docs/logging.md` with the self-hosted Loki/Grafana direction.

## Relevant Current Files

- `src/pages/api/auth/email-login.js`
- `src/pages/api/auth/google.js`
- `src/pages/api/auth/verify-login.js`
- `src/pages/api/haro/profile.js`
- `src/pages/api/haro/pitches.js`
- `src/pages/api/haro/mailbox/google/start.js`
- `src/pages/api/haro/mailbox/google/callback.js`
- `src/pages/api/haro/mailbox/disconnect.js`
- `src/pages/api/data.js`
- `src/lib/data/mongodb.js`
- `src/lib/data/haro.js`
- `src/lib/data/strapi.js`
- `package.json`
