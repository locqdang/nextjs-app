# Data Model: Improve Logging

## Application Log Event

Represents one structured log record emitted by the server-side application.

**Fields**
- `timestamp`: event time
- `level`: debug, info, warn, or error
- `message`: human-readable event summary
- `app`: application identifier
- `environment`: runtime environment
- `route`: API route or logical route name when applicable
- `method`: HTTP method when applicable
- `operation`: logical operation name
- `requestId`: correlation identifier for a request
- `userHash`: stable hashed user identifier for production-safe correlation
- `error`: sanitized error object when applicable
- `meta`: additional safe metadata after redaction

**Validation rules**
- Must not contain raw JWTs, OAuth tokens, passwords, or full sensitive request bodies.
- Production records must be JSON-structured.
- `userHash` must never equal the user’s plain email.

## Serialized Error

Represents the safe subset of an error that is allowed into logs.

**Fields**
- `name`
- `message`
- `code` (optional)
- `status` (optional)
- `stack` (allowed only under the configured safe rules)

**Validation rules**
- Must not embed full request or response objects.
- Must omit unrelated third-party config dumps.

## Request Log Context

Represents safe request-scoped metadata attached to route logs.

**Fields**
- `route`
- `method`
- `operation`
- `requestId`
- `userHash` (optional)
- `failureCategory` (optional)

**Relationships**
- One request context may be attached to many application log events for the same request.

## Redaction Rule Set

Represents the rules used before metadata is written to logs.

**Fields**
- `sensitiveKeyPatterns`
- `loginLinkLoggingGate`
- `productionModeBehavior`
- `hashSaltDependency`

**Validation rules**
- Keys matching token, auth, password, secret, credential, jwt, and login-link patterns must be removed or replaced.
- Production mode must always forbid login-link logging.

## Logging Stack Service

Represents an infrastructure component in the self-hosted logging flow.

**Variants**
- `alloy` for collection and shipping
- `loki` for storage
- `grafana` for querying

**Relationships**
- Alloy collects app container stdout logs and forwards them to Loki.
- Grafana queries Loki.
