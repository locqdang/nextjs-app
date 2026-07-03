# Observability Contract: Improve Logging

## Application logger contract

The server-side application exposes a centralized logger module that supports at least:

- `logger.debug(message, meta?)`
- `logger.info(message, meta?)`
- `logger.warn(message, meta?)`
- `logger.error(message, meta?)`

### Required behavior

- Production output is structured JSON.
- Error metadata is serialized through safe formatting rules.
- Sensitive values are redacted before logging.
- Login-link logging is blocked in production regardless of other flags.

## Request-context contract

Route-level logging should support attaching safe request context:

- `route`
- `method`
- `operation`
- `requestId`
- `userHash` when applicable
- `failureCategory` when applicable

### Prohibited fields

The contract forbids logging:

- raw bearer tokens
- JWTs
- OAuth access or refresh tokens
- encrypted token values
- passwords
- magic login links in production
- full auth, profile, or mailbox request bodies
- full request or response objects used only for debugging convenience

## Infrastructure flow contract

The system-wide log flow is:

```text
Next.js app -> structured stdout logs -> Docker log collection -> Grafana Alloy -> Loki -> Grafana
```

### Required infrastructure behavior

- The application must not post logs directly to Loki.
- Grafana must be bound locally only.
- The logging stack should identify the app service with stable labels so logs are easy to query.
- The retention target is 30 days.
