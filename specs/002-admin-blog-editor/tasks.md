# Tasks: Admin AI-Assisted Blog Editor

## Phase 1: Setup

- [ ] T001 Create the canonical feature docs under `specs/002-admin-blog-editor/`
- [ ] T002 Identify and confirm the existing auth, Strapi blog, and logging helpers that this feature will reuse

## Phase 2: Foundational

- [ ] T003 Create or extract an admin authorization helper for verified JWT plus role checks
- [ ] T004 [P] Create blog payload validation and normalization helpers
- [ ] T005 [P] Create AI-response validation helpers for `draft_from_prompt`
- [ ] T006 Create shared server-side helpers for safe admin blog logging

## Phase 3: User Story 1 - Admin manages blog posts manually

**Goal**: Ship a protected admin UI and API for listing, creating, editing, and publishing blog posts manually.

**Independent Test**: Admin can list, create, edit, and publish posts; anonymous and non-admin users are blocked.

- [ ] T007 [US1] Create the `/admin/blog` list page in the app route tree
- [ ] T008 [P] [US1] Create the `/admin/blog/new` page and form shell
- [ ] T009 [P] [US1] Create the `/admin/blog/[id]/edit` page and form shell
- [ ] T010 [US1] Implement `GET /api/admin/blog/posts` in `src/pages/api/admin/blog/posts/index.js`
- [ ] T011 [US1] Implement `POST /api/admin/blog/posts` in `src/pages/api/admin/blog/posts/index.js`
- [ ] T012 [P] [US1] Implement `GET /api/admin/blog/posts/[id]` in `src/pages/api/admin/blog/posts/[id].js`
- [ ] T013 [P] [US1] Implement `PUT /api/admin/blog/posts/[id]` in `src/pages/api/admin/blog/posts/[id].js`
- [ ] T014 [US1] Implement form-to-Strapi mapping for the supported v1 fields
- [ ] T015 [US1] Verify new and edited published posts render correctly on public blog pages

## Phase 4: User Story 2 - Admin gets AI draft assistance before saving

**Goal**: Add server-side AI draft generation that fills the editor without auto-saving or auto-publishing.

**Independent Test**: Admin can request an AI draft, review or edit it, and save only after explicit action.

- [ ] T016 [US2] Implement `POST /api/admin/blog/ai-assist` in `src/pages/api/admin/blog/ai-assist.js`
- [ ] T017 [US2] Add mocked AI-assist fixtures and contract-driven response handling
- [ ] T018 [P] [US2] Add AI prompt controls and response preview handling to the create form
- [ ] T019 [P] [US2] Add AI prompt controls and response preview handling to the edit form
- [ ] T020 [US2] Map validated AI responses into editable blog form state including `aiChatId`
- [ ] T021 [US2] Connect the real n8n webhook configuration after the mocked contract path is stable

## Phase 5: User Story 3 - Admin publishes safely with operational visibility

**Goal**: Ensure the feature is secure, validated, and observable in production-safe ways.

**Independent Test**: Success and failure paths log safe operational context without leaking secrets or unpublished content.

- [ ] T022 [US3] Add safe logging for admin blog list, create, update, and authorization failures
- [ ] T023 [P] [US3] Add safe logging for AI-assist request success and failure
- [ ] T024 [P] [US3] Add safe logging for Strapi write success and failure
- [ ] T025 [US3] Add unit tests for admin auth helper, payload validation, AI-response validation, and slug behavior
- [ ] T026 [US3] Add API tests for 401, 403, valid admin requests, invalid payloads, and controlled AI-assist failure handling

## Final Phase: Polish & Cross-Cutting Concerns

- [ ] T027 Document required environment variables and deployment notes
- [ ] T028 [P] Confirm publish semantics for the deployed Strapi version and adjust the save flow if needed
- [ ] T029 [P] Confirm defaults or preservation rules for authors, tags, and cover image in v1
- [ ] T030 Run final manual verification for admin access, manual publishing, AI-assisted drafting, and public blog rendering

## Dependencies

- Finish Phase 1 before Phase 2.
- Finish Phase 2 before user story work.
- User Story 1 should land before User Story 2 because AI assistance depends on the editor and secure save path.
- User Story 3 depends on the core flows existing so success and failure logging can be verified against real routes.

## Parallel opportunities

- T004 and T005 can be built in parallel after the request and response shapes are agreed.
- In User Story 1, the create and edit page shells can be built in parallel.
- In User Story 2, create-form and edit-form AI controls can be built in parallel once the endpoint contract is stable.
- In User Story 3, AI-assist logging and Strapi-write logging can be implemented in parallel.

## Implementation strategy

- MVP: Ship User Story 1 first for secure manual admin blog management.
- Second increment: Add User Story 2 for AI drafting through the server-side n8n proxy.
- Final increment: Complete User Story 3 and deployment polish.
