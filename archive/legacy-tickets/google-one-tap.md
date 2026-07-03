# Google One Tap

## Context

Google Sign-In in this app has two separate behaviors:

- Google Identity Services should initialize once at the app level.
- The Google sign-in button should render on login routes when the login UI is mounted.
- The One Tap prompt should still be allowed to appear on any page when Google determines it should.

This was previously documented in a standalone setup guide that mixed old Pages Router details with the current App Router implementation.

## Current Implementation

- App-level Google script load: `src/app/app-shell.tsx`
- Google initialization hook: `src/hooks/useGoogleOneTap.js`
- Login button container and render trigger: `src/app/login/login-client.tsx`
- Google auth API: `src/pages/api/auth/google.js`

## Expected Behavior

- Visiting a protected page such as `/haro` while logged out redirects to `/login?redirect=/haro`.
- The Google sign-in button renders on login routes after the login component mounts.
- The One Tap prompt can still appear on any page when the SDK is ready and the user is eligible.
- Successful Google login redirects to the requested in-app destination.

## Notes

- Keep button rendering tied to the login page DOM, not to the app shell.
- Keep Google initialization separate from button rendering.
- Prefer app-relative redirect targets only.
- Avoid re-initializing Google Identity Services on route changes.

## Follow-up

- Tighten redirect handling so the post-login fallback is `/` instead of `window.location.pathname`.
- Decide whether Google prompt behavior needs more explicit route gating or suppression on specific pages.
