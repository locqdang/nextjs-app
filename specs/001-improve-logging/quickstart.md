# Quickstart: Improve Logging

## Prerequisites

- Application dependencies installed
- Docker and Docker Compose available
- Production-like environment variables available for the app
- A safe `LOG_HASH_SALT` configured for any production-style hashing verification

## Validate the application logger

1. Add the logger dependency and helper module.
2. Run the targeted unit tests for logger helpers.
3. Start the app locally.
4. Trigger representative failures in:
   - email login
   - Google auth
   - HARO profile
   - HARO mailbox connect or disconnect
   - Strapi or Mongo-backed data fetches
5. Confirm logs are readable locally and do not expose forbidden values.

## Validate production-style safety behavior

1. Run the app with `NODE_ENV=production` in a controlled environment.
2. Trigger auth and mailbox flows that previously risked leaking sensitive values.
3. Confirm logs remain structured JSON.
4. Confirm magic login links, JWTs, OAuth tokens, encrypted token values, and raw bearer tokens do not appear.
5. Confirm repeated user activity can be correlated by `userHash` rather than plain email.

## Validate the self-hosted logging stack

1. Start the app and logging services together using the repo Compose files.
2. Confirm Loki, Alloy, and Grafana containers are healthy.
3. Open Grafana on the local-only bound URL.
4. Query recent logs for the app service labels.
5. Trigger fresh app logs and confirm they appear in Grafana.

## Expected outcomes

- Structured logs are visible for the targeted routes and helpers.
- Sensitive data is not present in sampled logs.
- Grafana is reachable locally and not publicly exposed.
- Operators can search app logs centrally without app-side direct shipping.
