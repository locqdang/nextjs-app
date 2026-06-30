#!/usr/bin/env node

// Hashes a user's email the same way app logs do, so the hash can be searched in Grafana/Loki.
// Reads LOG_HASH_SALT from the environment or from the project .env file without printing the salt.

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function loadEnvFile() {
  const envPath = path.resolve(process.cwd(), '.env');

  if (!fs.existsSync(envPath)) {
    return;
  }

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const equalsIndex = trimmed.indexOf('=');
    if (equalsIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, equalsIndex).trim();
    let value = trimmed.slice(equalsIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function hashUserIdentity(email, salt) {
  return crypto
    .createHmac('sha256', salt)
    .update(String(email).trim().toLowerCase())
    .digest('hex')
    .slice(0, 24);
}

loadEnvFile();

const email = process.argv[2];
const salt = process.env.LOG_HASH_SALT;

if (!email) {
  console.error('Usage: npm run hash-log-user -- user@example.com');
  process.exit(1);
}

if (!salt) {
  console.error('Missing LOG_HASH_SALT. Add it to .env or export it before running this script.');
  process.exit(1);
}

console.log(hashUserIdentity(email, salt));
