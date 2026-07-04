# Quickstart: Google One Tap Behavior and Login Flow

## Verify redirect behavior

1. Visit a protected route while logged out.
2. Confirm the app redirects to login with an app-relative redirect target.
3. Complete Google login.
4. Confirm the app returns to the intended in-app route.
5. Repeat with no redirect target and confirm the safe fallback destination is used.

## Verify client behavior

1. Load the app shell and confirm Google initialization occurs once.
2. Open the login route and confirm the button renders in the login UI.
3. Navigate between routes and confirm initialization is not repeated.
4. Confirm One Tap can still appear on eligible pages without moving button rendering into the app shell.
