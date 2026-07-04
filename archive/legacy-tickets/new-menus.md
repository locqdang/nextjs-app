# New Menus

## Context

The app needs a clearer navigation system that works on both desktop and mobile and separates:

- the public/site navigation tied to the Vietpolyglots brand
- the user/app navigation tied to services and account actions

The HARO area also needs contextual navigation that changes the left-side menu on desktop while keeping mobile simpler.

## Current Implementation

- Global navbar component: `src/components/Navbar.js`
- Global navbar styles: `src/styles/globals.css`
- Current HARO route: `src/app/haro/page.js`

## Expected Behavior

- The global navbar has two groups.
- The left group always includes `Home`.
- Outside HARO, the left group is: `Home`, `Projects`, `Contact`, `Book Meeting`.
- Outside HARO, the right group is: `Service`, `Account`.
- `HARO` appears under the `Service` dropdown.
- `Account` contains auth and user actions.
- When logged out, `Account` includes `Login`.
- When logged in, `Account` includes `Profile` and `Logout`.

- On desktop, when the user visits HARO, the left group changes to: `Home`, `Profile`, `Pitches`, `Mailbox`, `Journalists`.
- On desktop, the right group remains: `Service`, `Account`.
- On desktop, `Service` should still be available while inside HARO.

- On mobile, keep the main drawer/global navigation structure rather than replacing it with HARO-only links.
- On mobile HARO pages, use a compact top dropdown for HARO section switching.
- The compact HARO dropdown should expose: `Profile`, `Pitches`, `Mailbox`, `Journalists`.

## Notes

- Keep the navigation understandable on first glance on both mobile and desktop.
- Do not expose HARO subsections in the global header on mobile.
- Use contextual navigation on desktop, but simpler local section switching on mobile.
- Prefer `Book Meeting` as the navbar label rather than a longer booking label.
- `Mailbox` is preferred over `Connect Mailbox` in compact navigation labels.

## Follow-up

- Decide whether the HARO desktop left-group links should route to separate pages immediately or temporarily point to placeholders.
- Decide whether the `Account` dropdown should show the user name in the trigger when logged in.
- Confirm whether `Home` should point to `/` or to a specific landing section when clicked from HARO.
