# Tasks: HARO Profile Page and Gmail Mailbox Connection

## Phase 1: Setup

- [ ] T001 Create the canonical feature docs under `specs/003-haro-profile/`
- [ ] T002 Verify the current profile and mailbox flow behavior against the migrated implementation notes

## Phase 2: Foundational

- [ ] T003 Confirm and document the current `profiles` and `mailbox_connections` data boundaries
- [ ] T004 [P] Confirm JWT-based ownership checks remain the only profile authorization path
- [ ] T005 [P] Confirm token encryption and client non-exposure rules remain intact

## Phase 3: User Story 1 - User manages their HARO profile securely

**Goal**: Preserve and validate the working protected profile page and API behavior.

**Independent Test**: Authenticated users can load, create, edit, and reload their own profile without crossing user boundaries.

- [ ] T006 [US1] Verify `/haro/profile` loading, empty-state, success, and error states in `src/app/haro/profile/page.tsx` and `src/app/haro/profile/HaroProfileClient.tsx`
- [ ] T007 [US1] Verify protected `GET /api/haro/profile` behavior in `src/pages/api/haro/profile.js`
- [ ] T008 [US1] Verify protected `PUT /api/haro/profile` save behavior in `src/pages/api/haro/profile.js`
- [ ] T009 [US1] Add or update tests for authenticated ownership and profile save behavior

## Phase 4: User Story 2 - User connects and disconnects a Gmail mailbox safely

**Goal**: Preserve and validate the working Gmail mailbox connection lifecycle.

**Independent Test**: Authenticated users can connect and disconnect Gmail mailbox access without client exposure of raw OAuth tokens.

- [ ] T010 [US2] Verify mailbox start behavior in `src/pages/api/haro/mailbox/google/start.js`
- [ ] T011 [US2] Verify callback behavior in `src/pages/api/haro/mailbox/google/callback.js`
- [ ] T012 [US2] Verify disconnect behavior in `src/pages/api/haro/mailbox/disconnect.js`
- [ ] T013 [US2] Add or update tests for signed state verification, token storage boundaries, and disconnect cleanup

## Phase 5: User Story 3 - Operator gets polished callback UX and clear data boundaries

**Goal**: Close the remaining polish and operational clarity gaps.

**Independent Test**: Callback results are explicit on the profile page and operators can state the profile source of truth and deployment requirements clearly.

- [ ] T014 [US3] Show `mailbox` and `message` callback results more explicitly in `src/app/haro/profile/HaroProfileClient.tsx`
- [ ] T015 [US3] Optionally clear mailbox callback query parameters after displaying the result
- [ ] T016 [US3] Decide and document whether app Mongo `profiles` or an upstream HARO service is canonical
- [ ] T017 [P] [US3] Review and, if needed, implement a cleanup path for any legacy mailbox fields on `profiles`
- [ ] T018 [P] [US3] Harden deployment docs and config expectations for `NEXT_PUBLIC_FRONTEND_URL`, `GOOGLE_CALLBACK_URL`, and `GOOGLE_MAILBOX_CALLBACK_URL`
- [ ] T019 [US3] Confirm `.env.local` exclusion from production Docker inputs

## Final Phase: Polish & Cross-Cutting Concerns

- [ ] T020 Review safe logging behavior for profile load/save/connect/disconnect failures
- [ ] T021 [P] Update any docs or runbooks that still describe `/haro/profile` as a placeholder
- [ ] T022 Run final manual verification for load, save, connect, callback, and disconnect flows

## Dependencies

- Finish Phase 1 before later phases.
- Phase 3 and Phase 4 can proceed after foundational verification.
- User Story 3 depends on the current working baseline being verified first.

## Parallel opportunities

- T004 and T005 can run in parallel during foundational verification.
- In User Story 3, legacy-field cleanup review and deployment hardening review can run in parallel.

## Implementation strategy

- First, verify and preserve the current working feature.
- Next, improve callback-result UX.
- Finally, settle the source-of-truth and deployment-hardening follow-up work.
