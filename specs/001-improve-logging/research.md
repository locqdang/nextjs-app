# Research: Improve Logging

## Decision: Use Pino as the application logger

**Rationale**: The app is a Node/Next.js service and needs structured JSON output with low overhead. Pino is well-established for this use case and integrates cleanly with stdout-first Docker logging.

**Alternatives considered**:

- Winston: flexible, but heavier than needed for the requested logging flow.
- Direct `console.*` conventions: too inconsistent and too easy to misuse for sensitive data.

## Decision: Collect logs from Docker stdout rather than sending logs directly from app code to Loki

**Rationale**: This keeps application code simpler, avoids coupling the app to a specific logging backend, and matches the requested self-hosted operational model.

**Alternatives considered**:

- Direct HTTP shipping from app code to Loki: tighter coupling and more application complexity.
- File-based app logging: less aligned with container-native operations.

## Decision: Use Grafana Alloy as the Docker log shipper

**Rationale**: Alloy fits the desired Grafana-based stack and can read Docker container logs and forward them to Loki while preserving service labels.

**Alternatives considered**:

- Promtail: viable, but Alloy is the preferred newer Grafana agent path.
- Docker logging driver changes: possible later, but less explicit for this repo-local setup.

## Decision: Use Loki for storage and Grafana for querying

**Rationale**: Loki is purpose-built for logs and Grafana provides a familiar UI. This satisfies the requirement for a self-hosted backend and searchable interface.

**Alternatives considered**:

- SaaS logging provider: out of scope and explicitly not desired.
- Elasticsearch-style stack: more operational weight than necessary for current needs.

## Decision: Use hashed user identity in production logs

**Rationale**: Production debugging needs correlation across requests, but plain email should not appear in centralized logs. A stable hash provides correlation without exposing direct personal data.

**Alternatives considered**:

- Plain email: easier to query but exposes unnecessary personal data.
- No user identifier at all: weakens debugging for user-specific incidents.

## Decision: Allow sanitized production stack traces but forbid sensitive payload logging

**Rationale**: Stack traces are useful for self-hosted production debugging. The higher risk comes from logging request objects, tokens, secrets, and full payloads rather than the stack itself.

**Alternatives considered**:

- No production stacks: safer by default but weakens diagnostics.
- Full object dumps: unacceptable because they can leak secrets.

## Decision: Keep the logging stack inside this repository

**Rationale**: The legacy ticket explicitly chose repo-local Docker configuration rather than a separate `/home/loc/dockers/` stack. This keeps app and observability changes versioned together.

**Alternatives considered**:

- Separate host-level stack outside the repo: harder to track as part of the feature.
