# Contract: Google One Tap Login Flow

## Client behavior contract

- Google Identity Services initializes at the app level.
- The login button renders only when the login UI mounts.
- One Tap eligibility remains separate from button rendering.
- Route changes do not trigger duplicate initialization.

## Redirect behavior contract

- Protected routes preserve app-relative redirect targets.
- Successful login returns users to the validated target.
- Invalid or missing targets fall back to a safe in-app destination.
