# Tickets compatibility notes

The canonical location for Spec Kit feature work is now `specs/`.

Current migrated features:

- `tickets/improve-logging/` -> `specs/001-improve-logging/`
- `tickets/admin-ai-blog-editor/` -> `specs/002-admin-blog-editor/`
- `tickets/haro-profile.md` -> `specs/003-haro-profile/`
- `tickets/google-one-tap.md` -> `specs/004-google-one-tap/`
- `tickets/new-menus.md` -> `specs/005-new-menus/`

Compatibility guidance:

- Keep the existing `tickets/` files as historical and compatibility references unless explicitly pruned later.
- Prefer updating and extending the canonical files under `specs/001-improve-logging/`, `specs/002-admin-blog-editor/`, `specs/003-haro-profile/`, `specs/004-google-one-tap/`, and `specs/005-new-menus/`.
- The current legacy ticket set has been migrated into canonical `specs/` feature folders.
