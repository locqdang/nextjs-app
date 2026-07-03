# Feature Specification: New Menus and HARO Navigation

**Feature Branch**: `005-new-menus`

**Created**: 2026-07-03

**Status**: Draft

**Input**: Migrated from legacy notes in `tickets/new-menus.md`

## User Scenarios & Testing *(mandatory)*

### User Story 1 - User understands the main site navigation at a glance (Priority: P1)

As a site user, I want a clear global navbar with separated public and account-oriented navigation so I can understand where to go without guessing.

**Why this priority**: The main navbar is the top-level navigation pattern for the whole app and must be easy to scan first.

**Independent Test**: Visit non-HARO pages on desktop and mobile and confirm the expected global groups and labels appear.

**Acceptance Scenarios**:

1. **Given** a user is outside HARO, **When** the navbar renders, **Then** the left group shows `Home`, `Projects`, `Contact`, and `Book Meeting`.
2. **Given** a user is outside HARO, **When** the navbar renders, **Then** the right group shows `Service` and `Account`.
3. **Given** a logged-out user opens `Account`, **When** the menu opens, **Then** it includes `Login`.
4. **Given** a logged-in user opens `Account`, **When** the menu opens, **Then** it includes `Profile` and `Logout`.

---

### User Story 2 - HARO desktop navigation becomes contextual without losing global access (Priority: P2)

As a desktop user in HARO, I want contextual HARO navigation in the main left group while still keeping access to the broader service and account menus.

**Why this priority**: HARO needs its own navigation model, but it should not strand users away from the rest of the site.

**Independent Test**: Visit HARO on desktop and confirm the left group changes to the HARO section links while the right group still includes `Service` and `Account`.

**Acceptance Scenarios**:

1. **Given** a desktop user is on HARO, **When** the navbar renders, **Then** the left group shows `Home`, `Profile`, `Pitches`, `Mailbox`, and `Journalists`.
2. **Given** a desktop user is on HARO, **When** the navbar renders, **Then** the right group still shows `Service` and `Account`.
3. **Given** a desktop user is on HARO, **When** they open `Service`, **Then** the broader service navigation remains available.

---

### User Story 3 - HARO mobile navigation stays simple (Priority: P3)

As a mobile HARO user, I want a simple local section switcher without overcrowding the global mobile header.

**Why this priority**: Mobile needs a simpler approach than the desktop contextual navbar to stay understandable.

**Independent Test**: Visit HARO on mobile and confirm the main mobile drawer stays global while HARO sections are accessed through a compact local dropdown.

**Acceptance Scenarios**:

1. **Given** a mobile user is on HARO, **When** the page renders, **Then** the global mobile navigation remains the main drawer structure.
2. **Given** a mobile user is on HARO, **When** they open the local HARO switcher, **Then** it shows `Profile`, `Pitches`, `Mailbox`, and `Journalists`.
3. **Given** a mobile user is on HARO, **When** the header renders, **Then** HARO subsections are not exposed as a full global-header link set.

### Edge Cases

- What happens when HARO desktop subsection routes do not all exist yet?
- What happens when a logged-in user state changes while the account menu is open?
- What happens when a user navigates between HARO and non-HARO routes on the same client session?
- What happens when `Home` behavior differs between HARO context and general site context?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The global navbar MUST separate public navigation from service and account navigation.
- **FR-002**: Outside HARO, the left group MUST show `Home`, `Projects`, `Contact`, and `Book Meeting`.
- **FR-003**: Outside HARO, the right group MUST show `Service` and `Account`.
- **FR-004**: The `Service` menu MUST include `HARO`.
- **FR-005**: The `Account` menu MUST include logged-out and logged-in variants.
- **FR-006**: On desktop HARO routes, the left group MUST switch to `Home`, `Profile`, `Pitches`, `Mailbox`, and `Journalists`.
- **FR-007**: On desktop HARO routes, the right group MUST continue to show `Service` and `Account`.
- **FR-008**: On mobile HARO routes, the app MUST keep the main drawer or global navigation structure instead of replacing it with HARO-only global links.
- **FR-009**: On mobile HARO routes, the app MUST provide a compact local section switcher for `Profile`, `Pitches`, `Mailbox`, and `Journalists`.
- **FR-010**: The navigation labels SHOULD prefer `Book Meeting` and `Mailbox` as documented.
- **FR-011**: The project SHOULD decide how temporary or placeholder HARO subsection routes behave if some destinations are not fully built yet.
- **FR-012**: The project SHOULD decide whether the account trigger shows the user name when logged in.
- **FR-013**: The project SHOULD confirm the desired `Home` destination behavior from HARO context.

### Key Entities *(include if feature involves data)*

- **Global Navbar Group**: One of the two top-level navigation groups shown in the main navbar.
- **HARO Desktop Context**: The route state that switches desktop left-side navigation into HARO-specific links.
- **HARO Mobile Section Switcher**: The compact local dropdown used to navigate HARO sections on mobile.
- **Account Menu State**: The logged-out or logged-in account action set.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users on non-HARO pages can identify the two main navbar groups and the expected labels at a glance.
- **SC-002**: Desktop HARO users can reach HARO sections from contextual left-side navigation without losing access to `Service` and `Account`.
- **SC-003**: Mobile HARO users can switch sections through a compact local control without overcrowding the global mobile header.
- **SC-004**: Logged-out and logged-in account states present the correct menu actions during verification.

## Assumptions

- The existing navbar component remains the baseline entry point for this feature.
- HARO requires different desktop navigation behavior than the rest of the site.
- Mobile should optimize for simplicity rather than mirroring desktop navigation exactly.
