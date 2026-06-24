# Improve Logging Design

Related requirements ticket: `tickets/improve-logging/improve-logging.md`

## Summary

Add structured application logging with `pino`, then collect Docker container logs into a self-hosted Grafana Loki + Grafana stack inside this repo.

Production currently runs from Docker Compose in this repo:

```txt
~/projects/vietpolyglots.com/docker-compose.yml
```

Current production app service:

```txt
service: nextjs-app
container_name: nextjs
host port: 3004 -> container port 3000
```

Grafana should be local-only. Use host port `3005` bound to localhost:

```txt
http://127.0.0.1:3005
```

`3005` was checked and is currently free. `3004` is already used by the app.

## Goals

1. Replace important server-side `console.*` logs with a centralized `pino` logger.
2. Keep logs safe: no tokens, no magic login links in production, no raw request bodies.
3. Add request context: route, operation, method, request ID, and hashed user identity where useful.
4. Keep production logs structured JSON.
5. Collect Docker logs into self-hosted Loki.
6. View/search logs through local-only Grafana.
7. Keep logs for 30 days.

## Non-goals

- Metrics stack
- Distributed tracing
- Alerts
- Public Grafana access
- SaaS logging provider
- Replacing every client-side browser `console.*` in the first pass

## Chosen Stack

### Application logger

Use `pino`.

Why:

- common Node.js structured logging package
- fast and lightweight
- writes JSON logs cleanly to stdout
- works well with Docker log collection

### Log storage

Use Grafana Loki.

Why:

- self-hostable
- designed for logs
- works well with Docker labels
- integrates directly with Grafana

### Log UI

Use Grafana.

Why:

- web UI for searching Loki logs
- local-only access is easy with Compose port binding
- can later support dashboards/alerts if wanted

### Log shipper

Use Grafana Alloy rather than having the app send logs directly to Loki.

Why:

- keeps application code simple
- app writes logs to stdout
- Docker captures stdout
- Alloy reads Docker container logs and sends them to Loki

Flow:

```txt
Next.js app -> Pino JSON logs -> Docker stdout logs -> Grafana Alloy -> Loki -> Grafana
```

## Repository File Design

Create these files:

```txt
src/lib/logger.js
src/lib/api-logging.js
src/tests/lib/logger.test.js
infra/logging/loki-config.yaml
infra/logging/alloy/config.alloy
infra/logging/grafana/provisioning/datasources/loki.yaml
docker-compose.logging.yml
docs/logging.md
```

Modify these files:

```txt
package.json
package-lock.json
docker-compose.yml
.github/workflows/ci.yml
.github/workflows/cd.yml
src/pages/api/auth/email-login.js
src/pages/api/auth/google.js
src/pages/api/auth/verify-login.js
src/pages/api/haro/profile.js
src/pages/api/haro/pitches.js
src/pages/api/haro/mailbox/google/start.js
src/pages/api/haro/mailbox/google/callback.js
src/pages/api/haro/mailbox/disconnect.js
src/pages/api/data.js
src/lib/data/mongodb.js
src/lib/data/haro.js
src/lib/data/strapi.js
.env.example
README.md
```

## Docker Compose Design

Keep the app Compose file simple, and add a companion Compose file for logging:

```txt
docker-compose.logging.yml
```

Run production with both files:

```bash
docker compose -f docker-compose.yml -f docker-compose.logging.yml up -d --build
```

### App service labels

Add labels to the existing `nextjs-app` service in `docker-compose.yml` so the log shipper can identify app logs:

```yaml
services:
  nextjs-app:
    labels:
      logging: 'loki'
      app: 'vietpolyglots'
      service: 'nextjs-app'
      environment: 'production'
```

Do not change the current app port mapping:

```yaml
ports:
  - '3004:3000'
```

### Logging services

`docker-compose.logging.yml` should add:

```yaml
services:
  loki:
    image: grafana/loki:<pinned-version>
    command: -config.file=/etc/loki/loki-config.yaml
    volumes:
      - ./infra/logging/loki-config.yaml:/etc/loki/loki-config.yaml:ro
      - loki-data:/loki
    restart: unless-stopped

  alloy:
    image: grafana/alloy:<pinned-version>
    command: run /etc/alloy/config.alloy --storage.path=/var/lib/alloy/data
    volumes:
      - ./infra/logging/alloy/config.alloy:/etc/alloy/config.alloy:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - alloy-data:/var/lib/alloy/data
    depends_on:
      - loki
    restart: unless-stopped

  grafana:
    image: grafana/grafana:<pinned-version>
    ports:
      - '127.0.0.1:3005:3000'
    environment:
      GF_SECURITY_ADMIN_USER: ${GRAFANA_ADMIN_USER:-admin}
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_ADMIN_PASSWORD:?Set GRAFANA_ADMIN_PASSWORD in .env}
      GF_AUTH_ANONYMOUS_ENABLED: 'false'
    volumes:
      - grafana-data:/var/lib/grafana
      - ./infra/logging/grafana/provisioning:/etc/grafana/provisioning:ro
    depends_on:
      - loki
    restart: unless-stopped

volumes:
  loki-data:
  alloy-data:
  grafana-data:
```

Implementation note: choose actual current image versions during implementation and pin them. Do not leave `latest`.

## Loki Design

Loki should:

- store logs locally in the `loki-data` Docker volume
- retain logs for 30 days
- receive logs only from internal Docker network
- not expose a public host port by default

`infra/logging/loki-config.yaml` should configure:

- filesystem storage
- retention period: 30 days / 720h
- compactor retention enabled
- reasonable local single-node settings

Suggested retention intent:

```yaml
limits_config:
  retention_period: 720h

compactor:
  retention_enabled: true
```

Implementation should verify the exact Loki config syntax against the Loki image version used.

## Grafana Design

Grafana should:

- be available only from the local machine
- bind to `127.0.0.1:3005`
- require login
- auto-provision Loki as a data source

Local URL:

```txt
http://127.0.0.1:3005
```

Do not expose Grafana through the public site or reverse proxy in this ticket.

Provisioning file:

```txt
infra/logging/grafana/provisioning/datasources/loki.yaml
```

Expected data source:

```yaml
apiVersion: 1

datasources:
  - name: Loki
    type: loki
    access: proxy
    url: http://loki:3100
    isDefault: true
```

## Alloy Log Shipping Design

Alloy should read Docker logs from the local Docker daemon and forward only relevant logs to Loki.

Preferred behavior:

- discover Docker containers
- keep logs from containers with label `logging=loki`
- attach labels such as:
  - `app="vietpolyglots"`
  - `service="nextjs-app"`
  - `environment="production"`
  - `container="nextjs"`

This avoids shipping unrelated Docker container logs from the machine.

Implementation should verify exact Alloy Docker discovery/log syntax against the selected Alloy version.

## Application Logger Design

Create:

```txt
src/lib/logger.js
```

Responsibilities:

1. Create the root `pino` logger.
2. Use JSON logs in production.
3. Optionally use readable logs in development.
4. Safely serialize errors.
5. Redact sensitive keys.
6. Generate stable user hashes.

### Log levels

Use environment variable:

```txt
LOG_LEVEL=info
```

Default behavior:

```txt
development: debug
production: info
```

### Sensitive field redaction

Redact keys such as:

```txt
token
auth
authorization
password
secret
access_token
refresh_token
accessToken
refreshToken
access_token_enc
refresh_token_enc
loginLink
jwt
credential
```

### Error serialization

Do not pass large/raw error objects directly in route logs.

Create helper:

```js
export function serializeError(error) {
  return {
    name: error?.name,
    message: error?.message || String(error),
    code: error?.code,
    status: error?.status || error?.statusCode,
    stack: shouldIncludeStack() ? error?.stack : undefined,
  };
}
```

Production may include sanitized stack traces in server logs, but API responses must never include stack traces.

### User hashing

Use HMAC-SHA256 rather than plain SHA256.

Environment variable:

```txt
LOG_HASH_SALT=<random-secret>
```

Function intent:

```js
export function hashUserIdentity(email) {
  if (!email || !process.env.LOG_HASH_SALT) return undefined;
  return crypto
    .createHmac('sha256', process.env.LOG_HASH_SALT)
    .update(email.trim().toLowerCase())
    .digest('hex')
    .slice(0, 24);
}
```

Why HMAC with salt:

- plain email should not appear in production logs
- stable hash lets us connect logs for the same user
- salt prevents easy lookup from common email lists

Production should require `LOG_HASH_SALT` if user hashing is used.

## API Logging Helper Design

Create:

```txt
src/lib/api-logging.js
```

Responsibilities:

- extract/generate request ID
- build route context
- hash user email when available
- provide child logger per request/operation

Suggested helpers:

```js
export function getRequestId(req) {}
export function createApiLogger(req, { route, operation, userEmail } = {}) {}
```

Request ID rules:

1. Use incoming `x-request-id` if present.
2. Otherwise generate `crypto.randomUUID()`.
3. Include request ID in response header when route code can easily do so:

```js
res.setHeader('x-request-id', requestId);
```

Example route usage:

```js
const log = createApiLogger(req, {
  route: '/api/haro/profile',
  operation: 'haro_profile_update',
  userEmail: email,
});

log.error({ error: serializeError(error) }, 'HARO profile API error');
```

## Email Login Fallback Design

File:

```txt
src/pages/api/auth/email-login.js
```

Current behavior:

- normal path sends login link to n8n using `N8N_LOGIN_WEBHOOK_URL`
- fallback path logs the login link if the webhook URL is unavailable

Production has `N8N_LOGIN_WEBHOOK_URL` configured, but the fallback should still be safe.

Design rule:

```js
const canLogLoginLinks =
  process.env.NODE_ENV !== 'production' && process.env.LOG_LOGIN_LINKS === '1';
```

Behavior:

- production: never print login links
- local dev: print login links only when `LOG_LOGIN_LINKS=1`
- if webhook is missing and link logging is not allowed, log a warning without the link

## Route Migration Order

Migrate server-side logging in this order:

1. `src/pages/api/auth/email-login.js`
2. `src/pages/api/haro/mailbox/google/start.js`
3. `src/pages/api/haro/mailbox/google/callback.js`
4. `src/pages/api/haro/mailbox/disconnect.js`
5. `src/pages/api/haro/profile.js`
6. `src/pages/api/haro/pitches.js`
7. `src/pages/api/auth/google.js`
8. `src/pages/api/auth/verify-login.js`
9. `src/pages/api/data.js`
10. `src/lib/data/mongodb.js`
11. `src/lib/data/haro.js`
12. `src/lib/data/strapi.js`

Leave client-side browser logs for a later cleanup unless they expose sensitive data.

## Data Helper Logging Design

For DB/data helper modules:

```txt
src/lib/data/mongodb.js
src/lib/data/haro.js
src/lib/data/strapi.js
```

Rules:

- successful connection logs become debug-level
- operation failures remain error-level
- include safe fields:
  - `db`
  - `collectionName`
  - `operation`
- do not log full query objects by default
- fix `countDocuments()` error message in `src/lib/data/haro.js`

Example:

```js
logger.error(
  {
    operation: 'count_documents',
    collectionName,
    error: serializeError(error),
  },
  'MongoDB countDocuments failed'
);
```

## Testing Design

### Unit tests

Create:

```txt
src/tests/lib/logger.test.js
```

Test:

1. `serializeError()` includes message/name/code/status.
2. `serializeError()` does not include arbitrary nested config/request objects.
3. redaction removes token-like fields.
4. `hashUserIdentity()` returns the same hash for email case/spacing variants.
5. `hashUserIdentity()` does not return the plain email.

### API tests

Add or update tests around:

```txt
e2e/api-auth-email-login.spec.js
```

Test intent:

- with `NODE_ENV=production`, fallback path must not print magic login link
- with local/dev opt-in, fallback can print the login link for developer use

If changing `NODE_ENV` inside the current test runner is awkward, test the pure helper that decides whether login links can be logged.

### Docker/logging manual verification

After implementation:

```bash
docker compose -f docker-compose.yml -f docker-compose.logging.yml up -d --build
```

Check services:

```bash
docker compose -f docker-compose.yml -f docker-compose.logging.yml ps
```

Open Grafana locally:

```txt
http://127.0.0.1:3005
```

Search in Grafana Explore using Loki:

```txt
{app="vietpolyglots"}
```

Trigger an app request:

```bash
curl -i http://127.0.0.1:3004/api/data
```

Then confirm a related log appears in Grafana/Loki.

## Deployment Design

### CI/CD workflow adjustments

Current CD workflow:

```txt
.github/workflows/cd.yml
```

Current deploy command:

```bash
docker compose up -d --build
```

Because the logging stack will live in a separate Compose file, CD must change to include both Compose files:

```bash
docker compose -f docker-compose.yml -f docker-compose.logging.yml up -d --build
```

The CD deploy step should become:

```yaml
- name: Deploy on home runner
  run: |
    set -e
    cd /home/loc/projects/vietpolyglots.com
    git fetch origin
    git reset --hard origin/main
    docker compose -f docker-compose.yml -f docker-compose.logging.yml up -d --build
    docker image prune -f
```

Why this matters:

- `docker compose up -d --build` only reads `docker-compose.yml`.
- The logging services live in `docker-compose.logging.yml`.
- Without the `-f docker-compose.logging.yml` argument, CD would deploy the app but not Loki/Grafana/Alloy.

Current CI workflow:

```txt
.github/workflows/ci.yml
```

CI should be adjusted only as needed:

1. Keep existing lint, format, unit, integration, e2e, and build steps.
2. Ensure new logger tests run through the existing `npm run test:unit` command.
3. Ensure the production build has any required non-secret logging env vars, especially `LOG_LEVEL` if the build references it.
4. Do not require `GRAFANA_ADMIN_PASSWORD` or Loki/Grafana services during CI unless a future test explicitly starts the logging Compose stack.
5. Optionally add a Compose config validation step after `docker-compose.logging.yml` exists:

```bash
docker compose -f docker-compose.yml -f docker-compose.logging.yml config
```

This catches YAML/config errors without starting the production logging stack during CI.

### Runtime deployment steps

1. Add/update `.env` values:

```txt
LOG_LEVEL=info
LOG_HASH_SALT=<random-secret>
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=<strong-password>
```

Optional local development only:

```txt
LOG_LOGIN_LINKS=1
```

2. Rebuild and start with both Compose files:

```bash
docker compose -f docker-compose.yml -f docker-compose.logging.yml up -d --build
```

3. Verify app remains available:

```txt
http://127.0.0.1:3004
```

4. Verify Grafana is local-only:

```txt
http://127.0.0.1:3005
```

5. Verify logs appear in Grafana.

## Rollback Design

If logging stack causes issues:

1. Stop only the logging stack:

```bash
docker compose -f docker-compose.yml -f docker-compose.logging.yml stop grafana alloy loki
```

2. Keep the app running on existing service/port.

If app logging code causes issues:

1. Revert logger-related code changes.
2. Rebuild app container:

```bash
docker compose up -d --build nextjs-app
```

## Implementation Plan Preview

A later implementation plan should split this into small tasks:

1. Add `pino` dependency.
2. Add logger helpers and unit tests.
3. Guard email-login fallback logging.
4. Migrate API route logs.
5. Migrate data helper logs and fix `countDocuments()` message.
6. Add Loki/Grafana/Alloy Compose files.
7. Update CI/CD:
   - CD deploy command uses both Compose files.
   - CI optionally validates the combined Compose config.
8. Add logging docs.
9. Run unit/e2e/build verification.
10. Start Compose stack and verify logs in Grafana.
