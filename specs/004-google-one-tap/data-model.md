# Data Model: Google One Tap Behavior and Login Flow

## Login Redirect Target

Represents the intended in-app destination after successful login.

**Fields**
- requested target
- validated app-relative target
- fallback target

## Google Initialization Context

Represents the app-level SDK load and initialization state.

**Fields**
- script loaded state
- SDK initialized state
- current client eligibility inputs

## Login Button Render Target

Represents the login-page container used to mount the Google sign-in button.

## One Tap Eligibility State

Represents whether the prompt may appear for a user on a route based on runtime eligibility and configured behavior.
