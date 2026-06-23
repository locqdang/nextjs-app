# nextjs-app

## Getting started

### Environment setup

This project uses a split environment setup:

- `.env` = shared defaults / production-safe values
- `.env.local` = local machine secrets and local overrides for `next dev`
- `.env.example` = documented template you can copy from safely

#### 1. Copy the example file into `.env`

```bash
cp .env.example .env
```

#### 2. Put real shared/default values into `.env`

Use `.env` for the baseline values the app should have in normal and production-like runs.

#### 3. Add machine-specific secrets and local overrides in `.env.local`

At minimum, local development often needs secrets like:

```env
STRAPI_API_TOKEN=
MONGO_URI=
JWT_SECRET=
GOOGLE_CLIENT_SECRET=
```

If you debug locally on port `33345`, add overrides like:

```env
NEXT_PUBLIC_FRONTEND_URL=http://localhost:33345
GOOGLE_CALLBACK_URL=http://localhost:33345/api/auth/google/callback
GOOGLE_MAILBOX_CALLBACK_URL=http://localhost:33345/api/haro/mailbox/google/callback
```

If a variable is the same locally and in production, keep it only in `.env`.

### Environment loading behavior

For `npm run dev`, Next.js loads environment files automatically and `.env.local` overrides `.env`.

That means:

- keep shared / production-safe defaults in `.env`
- keep only machine-specific secrets and local overrides in `.env.local`

### Mailbox OAuth config

The HARO mailbox flow uses these environment variables:

- `NEXT_PUBLIC_FRONTEND_URL`
- `GOOGLE_CALLBACK_URL`
- `GOOGLE_MAILBOX_CALLBACK_URL`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `JWT_SECRET`
- optional: `MAILBOX_TOKEN_ENCRYPTION_KEY`

If `GOOGLE_MAILBOX_CALLBACK_URL` is not set, the mailbox route falls back to:

```text
${NEXT_PUBLIC_FRONTEND_URL}/api/haro/mailbox/google/callback
```

For Google Cloud OAuth, register both local and production redirect URIs if you use both:

```text
http://localhost:33345/api/haro/mailbox/google/callback
https://vietpolyglots.com/api/haro/mailbox/google/callback
```

### Docker / CI-CD note

`docker-compose.yml` is configured to load only `.env`.

That is intentional so production or CI/CD runs do not accidentally inherit localhost overrides from `.env.local`.

## Run the development server

```bash
npm run dev -- --inspect --port 33345
```

Then open [http://localhost:33345](http://localhost:33345).

## Notes

- `.env.example` is safe to commit and documents required variables.
- `.env.local` should not be committed.
- `.env` should not contain localhost overrides.
- Mailbox OAuth tokens are stored in the `mailbox_connections` collection, not `profiles`.

## Logging stack

This project now includes a local self-hosted logging stack using Alloy, Loki, and Grafana.

Start the full stack with:

```bash
docker compose -f docker-compose.yml -f docker-compose.logging.yml up -d --build
```

# Logging

## Local development

This repo uses Alloy to collect Docker container logs and ship them to Loki.
The local logging stack is started with:

```bash
docker compose -f docker-compose.yml -f docker-compose.logging.yml up -d --build
```
