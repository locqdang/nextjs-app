# Tasks: New Menus and HARO Navigation

## Phase 1: Setup

- [ ] T001 Create the canonical feature docs under `specs/005-new-menus/`
- [ ] T002 Verify the current navbar component, style hooks, and HARO route context

## Phase 2: Foundational

- [ ] T003 Confirm auth-state-driven account menu behavior
- [ ] T004 Confirm route-context detection for HARO versus non-HARO pages
- [ ] T005 Confirm mobile and desktop rendering boundaries in the current navbar

## Phase 3: User Story 1 - User understands the main site navigation at a glance

**Goal**: Establish the two-group global navbar outside HARO.

**Independent Test**: Non-HARO routes show the expected public and account/service groups.

- [ ] T006 [US1] Implement outside-HARO left-group links in `src/components/Navbar.js`
- [ ] T007 [US1] Implement outside-HARO right-group menus in `src/components/Navbar.js`
- [ ] T008 [US1] Verify `Account` menu behavior for logged-out and logged-in states

## Phase 4: User Story 2 - HARO desktop navigation becomes contextual without losing global access

**Goal**: Add HARO-specific left-side desktop navigation while preserving global right-side menus.

**Independent Test**: HARO desktop routes show contextual left-side links and still keep `Service` and `Account`.

- [ ] T009 [US2] Implement HARO desktop left-group links in `src/components/Navbar.js`
- [ ] T010 [US2] Preserve `Service` and `Account` menus in HARO desktop context
- [ ] T011 [US2] Decide how unfinished HARO subsection destinations behave if some routes are placeholders

## Phase 5: User Story 3 - HARO mobile navigation stays simple

**Goal**: Add a compact local HARO switcher without overloading the global mobile header.

**Independent Test**: HARO mobile routes keep the global drawer and add a simple local section switcher.

- [ ] T012 [US3] Implement HARO mobile local section switcher
- [ ] T013 [US3] Ensure HARO subsection links do not become a full global-header set on mobile
- [ ] T014 [US3] Verify preferred labels `Book Meeting` and `Mailbox`

## Final Phase: Polish & Cross-Cutting Concerns

- [ ] T015 Decide whether the `Account` trigger should show the user name when logged in
- [ ] T016 Confirm the intended `Home` destination behavior from HARO context
- [ ] T017 Run final desktop and mobile navigation verification
