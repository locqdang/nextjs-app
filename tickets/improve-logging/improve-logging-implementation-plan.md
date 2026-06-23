# Improve Logging Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Implement structured app logging with Pino and a self-hosted Docker logging stack using Grafana Alloy, Loki, and Grafana.

**Architecture:** The Next.js app writes structured JSON logs to stdout using `pino`. Docker captures stdout, Grafana Alloy ships selected container logs to Loki, and local-only Grafana at `http://127.0.0.1:3005` provides the search UI. Production keeps 30 days of logs and never logs magic login links, tokens, raw request bodies, or plain user emails.

**Tech Stack:** Next.js, Node.js, Pino, Vitest, Playwright, Docker Compose, Grafana Alloy, Grafana Loki, Grafana.

Source docs:

- Requirements: `tickets/improve-logging/improve-logging.md`
- Design: `tickets/improve-logging/improve-logging-design.md`

---

## Important Implementation Rules

- Do not expose Grafana publicly. Bind it to `127.0.0.1:3005` only.
- Do not send logs directly from application code to Loki. App logs go to stdout.
- Do not log plain email in production. Use `userHash` from HMAC-SHA256 with `LOG_HASH_SALT`.
- Do not log magic login links in production.
- Do not log JWTs, OAuth tokens, encrypted token values, passwords, full request bodies, or full email bodies.
- Do not require Loki/Grafana to run during normal CI tests.
- Pin Docker images. Do not use `latest`.

---

## Task 1: Add Pino Dependency

**Objective:** Add the application logging dependency and update the lockfile.

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`

**Step 1: Install dependency**

Run:

```bash
npm install pino
```

Expected:

- `pino` appears under `dependencies` in `package.json`.
- `package-lock.json` is updated.

**Step 2: Verify install**

Run:

```bash
npm ls pino
```

Expected:

- The installed `pino` version is shown.

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add pino logging dependency"
```

---

## Task 2: Create Logger Module with Tests

**Objective:** Add the central logger helpers before migrating route code.

**Files:**

- Create: `src/lib/logger.js`
- Create: `src/tests/lib/logger.test.js`

**Step 1: Create failing tests**

Create `src/tests/lib/logger.test.js` with tests for:

- `serializeError()` includes `name`, `message`, `code`, `status`, and optional `stack`.
- `redactLogFields()` redacts token-like fields.
- `hashUserIdentity()` normalizes email case/spacing.
- `hashUserIdentity()` does not return the plain email.
- `canLogLoginLinks()` is false in production even when `LOG_LOGIN_LINKS=1`.
- `canLogLoginLinks()` is true only when non-production and `LOG_LOGIN_LINKS=1`.

Use the existing Vitest style:

```js
import { afterEach, describe, expect, it, vi } from 'vitest';
```

**Step 2: Run tests to verify failure**

Run:

```bash
npm run test:unit -- src/tests/lib/logger.test.js
```

Expected:

- FAIL because `src/lib/logger.js` does not exist yet.

**Step 3: Implement logger helper**

Create `src/lib/logger.js` exporting at least:

```js
import crypto from 'crypto';
import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

const SENSITIVE_KEY_PATTERN =
  /token|auth|authorization|password|secret|credential|jwt|loginlink/i;

export function shouldIncludeStack() {
  return process.env.LOG_INCLUDE_STACK !== '0';
}

export function serializeError(error) {
  if (!error) return undefined;

  return {
    name: error.name,
    message: error.message || String(error),
    code: error.code,
    status: error.status || error.statusCode,
    stack: shouldIncludeStack() ? error.stack : undefined,
  };
}

export function redactLogFields(value) {
  if (Array.isArray(value)) {
    return value.map(redactLogFields);
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      SENSITIVE_KEY_PATTERN.test(key) ? '[Redacted]' : redactLogFields(item),
    ])
  );
}

export function hashUserIdentity(email) {
  const salt = process.env.LOG_HASH_SALT;
  if (!email || !salt) return undefined;

  return crypto
    .createHmac('sha256', salt)
    .update(String(email).trim().toLowerCase())
    .digest('hex')
    .slice(0, 24);
}

export function canLogLoginLinks() {
  return process.env.NODE_ENV !== 'production' && process.env.LOG_LOGIN_LINKS === '1';
}

export const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  base: {
    app: 'vietpolyglots',
    environment: process.env.NODE_ENV || 'development',
  },
  serializers: {
    err: serializeError,
    error: serializeError,
  },
});
```

Implementation may adjust details, but tests must enforce the security behavior.

**Step 4: Run tests to verify pass**

Run:

```bash
npm run test:unit -- src/tests/lib/logger.test.js
```

Expected:

- PASS.

**Step 5: Commit**

```bash
git add src/lib/logger.js src/tests/lib/logger.test.js
git commit -m "feat: add safe logger helpers"
```

---

## Task 3: Create API Logging Helper with Tests

**Objective:** Standardize request ID, route context, operation context, and user hashing.

**Files:**

- Create: `src/lib/api-logging.js`
- Modify: `src/tests/lib/logger.test.js` or create `src/tests/lib/api-logging.test.js`

**Step 1: Write tests**

Test:

- `getRequestId(req)` uses incoming `x-request-id`.
- `getRequestId(req)` generates an ID when header is missing.
- `createApiLogger(req, { route, operation, userEmail })` includes route, method, operation, requestId, and `userHash` but not plain email.

**Step 2: Run tests to verify failure**

Run:

```bash
npm run test:unit -- src/tests/lib/api-logging.test.js src/tests/lib/logger.test.js
```

Expected:

- FAIL until helper exists.

**Step 3: Implement helper**

Create `src/lib/api-logging.js`:

```js
import crypto from 'crypto';
import { hashUserIdentity, logger } from './logger';

export function getRequestId(req) {
  const header = req?.headers?.['x-request-id'];
  if (Array.isArray(header)) return header[0];
  return header || crypto.randomUUID();
}

export function createApiLogger(req, { route, operation, userEmail } = {}) {
  return logger.child({
    route,
    operation,
    method: req?.method,
    requestId: getRequestId(req),
    userHash: hashUserIdentity(userEmail),
  });
}
```

Implementation may add `attachRequestIdHeader(res, requestId)` if useful.

**Step 4: Run tests to verify pass**

Run:

```bash
npm run test:unit -- src/tests/lib/api-logging.test.js src/tests/lib/logger.test.js
```

Expected:

- PASS.

**Step 5: Commit**

```bash
git add src/lib/api-logging.js src/tests/lib/logger.test.js src/tests/lib/api-logging.test.js
git commit -m "feat: add API logging context helper"
```

---

## Task 4: Guard Email Login Fallback Logging

**Objective:** Ensure magic login links can never be printed in production.

**Files:**

- Modify: `src/pages/api/auth/email-login.js`
- Test: `src/tests/lib/logger.test.js` or `e2e/api-auth-email-login.spec.js`

**Step 1: Update code**

In `src/pages/api/auth/email-login.js`:

- import `logger`, `serializeError`, and `canLogLoginLinks`
- replace raw `console.error`/`console.warn`
- log the magic link only when `canLogLoginLinks()` is true

Behavior:

```js
if (N8N_WEBHOOK_URL) {
  // send to n8n
} else if (canLogLoginLinks()) {
  logger.warn({ email: user.email, loginLink }, 'Development login link generated');
} else {
  logger.warn('N8N login webhook is unavailable; login link suppressed');
}
```

Note: if logging `loginLink` through `logger.warn`, ensure redaction rules or local-only condition prevent production leakage.

**Step 2: Add/adjust tests**

At minimum, `canLogLoginLinks()` unit tests from Task 2 cover the production guard.

If practical, add an API test in `e2e/api-auth-email-login.spec.js` that verifies invalid/wrong-method requests remain safe.

**Step 3: Run targeted checks**

Run:

```bash
npm run test:unit -- src/tests/lib/logger.test.js
npm run test:e2e -- e2e/api-auth-email-login.spec.js
```

Expected:

- PASS.

**Step 4: Commit**

```bash
git add src/pages/api/auth/email-login.js src/tests/lib/logger.test.js e2e/api-auth-email-login.spec.js
git commit -m "fix: guard email login link logging"
```

---

## Task 5: Migrate HARO Mailbox Route Logs

**Objective:** Replace raw logging in the OAuth mailbox flow with structured safe logs.

**Files:**

- Modify: `src/pages/api/haro/mailbox/google/start.js`
- Modify: `src/pages/api/haro/mailbox/google/callback.js`
- Modify: `src/pages/api/haro/mailbox/disconnect.js`

**Step 1: Update `start.js`**

Use `createApiLogger(req, { route, operation })` before auth decoding.

After decoding email, create a child logger with `userEmail` if helpful.

Log failures with:

```js
log.error({ error: serializeError(error) }, 'HARO mailbox Google start error');
```

**Step 2: Update `callback.js`**

Log callback failures with route and operation context. Do not log OAuth code, state token, access token, or refresh token.

**Step 3: Update `disconnect.js`**

For decrypt/revoke failures:

- log `message`, `code`, `status`, stack if available
- do not log token values

**Step 4: Run relevant tests**

Run:

```bash
npm run test:e2e -- e2e/api-haro-mailbox-google-start.spec.js e2e/api-haro-mailbox-google-callback.spec.js e2e/api-haro-mailbox-disconnect.spec.js
```

Expected:

- PASS.

**Step 5: Commit**

```bash
git add src/pages/api/haro/mailbox/google/start.js src/pages/api/haro/mailbox/google/callback.js src/pages/api/haro/mailbox/disconnect.js
git commit -m "feat: add structured HARO mailbox logging"
```

---

## Task 6: Migrate HARO Profile and Pitches Logs

**Objective:** Replace raw logs in core HARO API routes with contextual structured logs.

**Files:**

- Modify: `src/pages/api/haro/profile.js`
- Modify: `src/pages/api/haro/pitches.js`

**Step 1: Update profile route**

Add route logging for:

- profile load failures
- profile save failures
- JWT/auth failures

Use hashed user identity after decoding email.

**Step 2: Update pitches route**

Replace:

```js
console.log(e);
```

with structured error logging:

```js
log.error({ error: serializeError(e) }, 'HARO pitches API error');
```

Do not log full query objects or full profile bodies.

**Step 3: Run relevant tests**

Run:

```bash
npm run test:e2e -- e2e/api-haro-profile.spec.js e2e/api-haro-pitches.spec.js
```

Expected:

- PASS.

**Step 4: Commit**

```bash
git add src/pages/api/haro/profile.js src/pages/api/haro/pitches.js
git commit -m "feat: add structured HARO API logging"
```

---

## Task 7: Migrate Auth and Data API Logs

**Objective:** Replace raw logs in remaining key API routes.

**Files:**

- Modify: `src/pages/api/auth/google.js`
- Modify: `src/pages/api/auth/verify-login.js`
- Modify: `src/pages/api/data.js`

**Step 1: Update auth routes**

For Google auth and verify-login:

- log route/operation/method/request ID
- avoid logging raw credential/JWT/token

**Step 2: Update data route**

Replace Strapi/Mongo warnings and generic API error with structured logs.

**Step 3: Run relevant tests**

Run:

```bash
npm run test:e2e -- e2e/api-auth-google.spec.js e2e/api-auth-verify-login.spec.js e2e/api-data.spec.js
npm run test:integration -- src/tests/api/data.integration.test.js
```

Expected:

- PASS.

**Step 4: Commit**

```bash
git add src/pages/api/auth/google.js src/pages/api/auth/verify-login.js src/pages/api/data.js
git commit -m "feat: add structured auth and data API logging"
```

---

## Task 8: Migrate Data Helper Logs and Fix Count Message

**Objective:** Replace data helper console logs and fix the misleading `countDocuments()` message.

**Files:**

- Modify: `src/lib/data/mongodb.js`
- Modify: `src/lib/data/haro.js`
- Modify: `src/lib/data/strapi.js`
- Modify: `src/tests/lib/strapi.test.js` if it spies on `console.error`

**Step 1: Update MongoDB helper**

In `src/lib/data/mongodb.js`:

- successful connection logs become `logger.debug`
- DB failures become `logger.error`
- include `collectionName` and `operation`
- do not log query objects by default

**Step 2: Update HARO DB helper**

Same pattern as MongoDB helper.

Fix `countDocuments()` catch message from delete to count.

**Step 3: Update Strapi helper**

Replace `console.error` with structured logger.

**Step 4: Update tests**

`src/tests/lib/strapi.test.js` currently spies on `console.error`. Update it to spy on the logger or just assert thrown behavior, depending on implementation.

**Step 5: Run targeted tests**

Run:

```bash
npm run test:unit -- src/tests/lib/strapi.test.js src/tests/lib/logger.test.js src/tests/lib/api-logging.test.js
```

Expected:

- PASS.

**Step 6: Commit**

```bash
git add src/lib/data/mongodb.js src/lib/data/haro.js src/lib/data/strapi.js src/tests/lib/strapi.test.js
git commit -m "feat: migrate data helper logging"
```

---

## Task 9: Add Loki, Grafana, and Alloy Compose Files

**Objective:** Add the self-hosted logging stack inside the repo.

**Files:**

- Create: `docker-compose.logging.yml`
- Create: `infra/logging/loki-config.yaml`
- Create: `infra/logging/alloy/config.alloy`
- Create: `infra/logging/grafana/provisioning/datasources/loki.yaml`
- Modify: `docker-compose.yml`

**Step 1: Pick pinned image versions**

Before writing files, check current stable tags for:

- `grafana/loki`
- `grafana/grafana`
- `grafana/alloy`

Do not use `latest`.

**Step 2: Add app labels**

Modify `docker-compose.yml`:

```yaml
services:
  nextjs-app:
    labels:
      logging: "loki"
      app: "vietpolyglots"
      service: "nextjs-app"
      environment: "production"
```

Do not change existing app port mapping:

```yaml
ports:
  - '3004:3000'
```

**Step 3: Add logging Compose file**

Create `docker-compose.logging.yml` with services:

- `loki`
- `alloy`
- `grafana`

Grafana port must be local-only:

```yaml
ports:
  - '127.0.0.1:3005:3000'
```

**Step 4: Add Loki config**

Configure:

- filesystem storage
- 30-day retention (`720h`)
- compactor retention enabled

**Step 5: Add Alloy config**

Configure Alloy to:

- discover Docker containers
- keep only containers labeled `logging=loki`
- forward logs to `http://loki:3100/loki/api/v1/push`
- attach labels for app/service/environment/container

**Step 6: Add Grafana datasource provisioning**

Create Loki datasource pointing to:

```txt
http://loki:3100
```

**Step 7: Validate Compose config**

Run:

```bash
docker compose -f docker-compose.yml -f docker-compose.logging.yml config
```

Expected:

- Config renders without errors.

**Step 8: Commit**

```bash
git add docker-compose.yml docker-compose.logging.yml infra/logging/
git commit -m "feat: add self-hosted logging stack"
```

---

## Task 10: Update Environment Templates and Documentation

**Objective:** Document required logging environment variables and usage.

**Files:**

- Modify: `.env.example`
- Modify: `README.md`
- Create: `docs/logging.md`

**Step 1: Update `.env.example`**

Add non-secret/default-safe placeholders:

```env
LOG_LEVEL=info
LOG_HASH_SALT=
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=
# Local development only. Never set this in production unless you intentionally want dev login links printed.
LOG_LOGIN_LINKS=
```

**Step 2: Update README**

Add a short note that production deployment now uses:

```bash
docker compose -f docker-compose.yml -f docker-compose.logging.yml up -d --build
```

and Grafana is local-only at:

```txt
http://127.0.0.1:3005
```

**Step 3: Create `docs/logging.md`**

Document:

- local dev logging
- production Docker logging
- how Pino logs reach Loki
- how to open Grafana
- what not to log
- 30-day retention
- rollback commands

**Step 4: Commit**

```bash
git add .env.example README.md docs/logging.md
git commit -m "docs: document logging stack"
```

---

## Task 11: Update CI/CD Workflows

**Objective:** Ensure CI validates the new Compose config and CD starts the logging stack.

**Files:**

- Modify: `.github/workflows/ci.yml`
- Modify: `.github/workflows/cd.yml`

**Step 1: Update CD**

Change deploy command in `.github/workflows/cd.yml` from:

```bash
docker compose up -d --build
```

to:

```bash
docker compose -f docker-compose.yml -f docker-compose.logging.yml up -d --build
```

**Step 2: Update CI**

After `docker-compose.logging.yml` exists, add a Compose config validation step:

```yaml
      - name: Validate Docker Compose config
        run: docker compose -f docker-compose.yml -f docker-compose.logging.yml config
```

Do not start Loki/Grafana in CI unless a later task requires it.

**Step 3: Run workflow-equivalent local checks**

Run:

```bash
npm run lint
npm run format:check
npm run test:unit
npm run test:integration
npm run build
docker compose -f docker-compose.yml -f docker-compose.logging.yml config
```

Expected:

- All pass.

**Step 4: Commit**

```bash
git add .github/workflows/ci.yml .github/workflows/cd.yml
git commit -m "ci: validate logging compose deployment"
```

---

## Task 12: Full Local Verification

**Objective:** Prove the app and logging stack work together.

**Files:**

- No code changes expected unless verification finds bugs.

**Step 1: Run full checks**

Run:

```bash
npm run lint
npm run format:check
npm run test:unit
npm run test:integration
npm run test:e2e
npm run build
```

Expected:

- All pass.

**Step 2: Ensure `.env` has required local production values**

Check `.env` has:

```env
LOG_LEVEL=info
LOG_HASH_SALT=<random-secret>
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=<strong-password>
```

Do not commit real secrets.

**Step 3: Start stack**

Run:

```bash
docker compose -f docker-compose.yml -f docker-compose.logging.yml up -d --build
```

Expected:

- App container starts.
- Loki starts.
- Alloy starts.
- Grafana starts.

**Step 4: Check services**

Run:

```bash
docker compose -f docker-compose.yml -f docker-compose.logging.yml ps
```

Expected:

- Services are running.

**Step 5: Smoke test app**

Run:

```bash
curl -i http://127.0.0.1:3004/api/data
```

Expected:

- HTTP response from app.

**Step 6: Open Grafana**

Open:

```txt
http://127.0.0.1:3005
```

Expected:

- Grafana login page appears locally.
- Loki datasource exists.

**Step 7: Search logs**

In Grafana Explore, query:

```txt
{app="vietpolyglots"}
```

Expected:

- App logs appear.
- Logs include route/operation context where route code was migrated.
- Logs do not include tokens, login links, or plain user emails.

**Step 8: Commit any fixes from verification**

If fixes were required:

```bash
git add <changed-files>
git commit -m "fix: complete logging stack verification"
```

---

## Task 13: Final Review Before Deploy

**Objective:** Verify the implementation satisfies the requirements and design.

**Files:**

- Review: `tickets/improve-logging/improve-logging.md`
- Review: `tickets/improve-logging/improve-logging-design.md`
- Review: `tickets/improve-logging/improve-logging-implementation-plan.md`

**Checklist:**

- [ ] Central logger exists.
- [ ] API logging helper exists.
- [ ] Magic login links cannot be logged in production.
- [ ] User identity is hashed, not plain email.
- [ ] Token-like fields are redacted or never logged.
- [ ] Key server-side `console.*` calls are migrated.
- [ ] `countDocuments()` log message is fixed.
- [ ] Docker logging stack is in repo.
- [ ] Grafana is local-only on `127.0.0.1:3005`.
- [ ] Loki retention is configured for 30 days.
- [ ] CD uses both Compose files.
- [ ] CI validates combined Compose config.
- [ ] Docs explain how to view logs and what not to log.
- [ ] Full tests/build pass.
- [ ] Logs appear in Grafana.

**Step 1: Final commit if needed**

```bash
git status
```

Expected:

- Working tree clean or only intentional uncommitted changes.

**Step 2: Deployment readiness**

If everything passes, deploy through the normal CD path or manually run:

```bash
docker compose -f docker-compose.yml -f docker-compose.logging.yml up -d --build
```

---

## Rollback Commands

Stop only logging stack while keeping app running:

```bash
docker compose -f docker-compose.yml -f docker-compose.logging.yml stop grafana alloy loki
```

Rebuild only app after reverting app logging code:

```bash
docker compose up -d --build nextjs-app
```

---

## Notes for Implementation

- Keep changes small and commit after each task.
- If Docker image config syntax differs from the design, verify against the selected pinned image version and update `tickets/improve-logging/improve-logging-design.md` if needed.
- If a test becomes too brittle by checking logger internals, prefer testing the helper behavior and route response behavior.
- If logging route failures would require large refactors, migrate gradually but keep the security-critical email-login guard in the first implementation slice.
