# Research: Google One Tap Behavior and Login Flow

## Decision: Keep Google Identity Services initialization at the app level

**Rationale**: Initialization belongs in one shared app-level place so the SDK is available consistently without route-by-route duplication.

## Decision: Keep button rendering on login-page DOM only

**Rationale**: The button is part of the login route UX and should not be coupled to the app shell.

## Decision: Treat One Tap prompt eligibility separately from button rendering

**Rationale**: The prompt can appear on eligible pages even when the button itself is only rendered on the login page.

## Decision: Prefer app-relative redirect targets and a safe fallback

**Rationale**: Redirect safety prevents broken or unsafe post-login behavior and matches the desired in-app navigation model.

## Decision: Avoid re-initialization on route changes

**Rationale**: Repeated initialization risks duplicate handlers, inconsistent prompt behavior, and harder-to-debug login UX.
