# Feature Specification: Admin AI-Assisted Blog Editor

**Feature Branch**: `002-admin-blog-editor`

**Created**: 2026-07-03

**Status**: Draft

**Input**: Migrated from legacy requirements in `tickets/admin-ai-blog-editor/admin-ai-blog-editor.md`

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin manages blog posts manually (Priority: P1)

As an admin, I want a protected blog management area where I can list, create, edit, and publish blog posts used by the public site.

**Why this priority**: Manual admin create and edit capability is the minimum valuable slice. AI assistance depends on the editor and secure write flow already existing.

**Independent Test**: Log in as an admin, open `/admin/blog`, create a post with manual fields only, publish it, edit an existing post, and verify public blog rendering still works.

**Acceptance Scenarios**:

1. **Given** an authenticated admin opens the admin blog area, **When** they request the posts list, **Then** they can view existing posts and open create or edit flows.
2. **Given** an authenticated admin submits a valid manual post payload, **When** the server processes it, **Then** the post is saved to Strapi without exposing Strapi credentials to the browser.
3. **Given** an authenticated non-admin or anonymous user requests an admin blog route, **When** authorization is evaluated, **Then** access is denied.

---

### User Story 2 - Admin gets AI draft assistance before saving (Priority: P2)

As an admin, I want to request an AI-generated blog draft through a server-side n8n integration so I can speed up drafting while still reviewing and editing the result before publication.

**Why this priority**: AI assistance is valuable, but the core admin editing workflow must exist first. This story adds acceleration without changing the trust model.

**Independent Test**: Log in as an admin, request an AI draft from the create or edit form, verify the response fills editable form fields, edit the content, and save only after explicit admin action.

**Acceptance Scenarios**:

1. **Given** an authenticated admin submits a draft prompt, **When** the app sends a server-side AI assist request, **Then** the browser never receives the raw n8n webhook secret.
2. **Given** n8n returns a valid AI draft response, **When** the admin receives the result, **Then** the draft is inserted into the editable form and is not auto-saved or auto-published.
3. **Given** the n8n request fails or returns invalid data, **When** the UI handles the failure, **Then** the admin sees a controlled error state and no partial publish occurs.

---

### User Story 3 - Admin publishes safely with operational visibility (Priority: P3)

As the site operator, I want admin blog operations logged safely and validated carefully so publishing remains secure and debuggable in production.

**Why this priority**: This supports reliability and incident handling, but it depends on the core admin and AI flows already existing.

**Independent Test**: Exercise list, create, update, and AI-assist flows with success and failure cases and verify logs contain safe operational context without leaking JWTs, secrets, or full unpublished drafts.

**Acceptance Scenarios**:

1. **Given** an admin blog API request starts or completes, **When** the server logs the event, **Then** the log includes safe operational context without plain JWTs or full sensitive payloads.
2. **Given** an unauthorized or forbidden request hits an admin route, **When** the event is logged, **Then** the log records the failure safely without exposing the raw token or full email.
3. **Given** an AI-assist or Strapi write request fails, **When** the error is logged and returned, **Then** the admin gets a generic client-facing error and operators get safe server-side details.

### Edge Cases

- What happens when the admin leaves `slug` blank during create or edit?
- What happens when n8n returns invalid rich text, missing required blog fields, or a malformed `aiChatId`?
- What happens when an existing post has authors, tags, or cover image data that v1 does not edit?
- What happens when the deployed Strapi version requires different publish semantics than a simple `publishedAt` write?
- What happens when a non-admin user manually calls the admin API routes even if the client UI is hidden?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide protected admin blog UI routes for listing posts, creating a post, and editing an existing post.
- **FR-002**: The system MUST provide server-side admin blog API routes for list, create, read, update, and AI-assist operations.
- **FR-003**: The system MUST verify JWTs server-side for every admin blog API route.
- **FR-004**: The system MUST derive user identity from the verified JWT and MUST require the resolved user to have `role === 'admin'`.
- **FR-005**: The system MUST deny anonymous users and authenticated non-admin users access to admin blog operations.
- **FR-006**: The system MUST support manual create and edit of the blog fields already used by the public blog UI, including title, slug, excerpt, date, featured state, and paragraphs.
- **FR-007**: The system MUST allow direct publish behavior in v1.
- **FR-008**: The system MUST preserve or default non-v1 fields such as cover image, authors, and tags according to the documented scope.
- **FR-009**: The system MUST proxy AI assistance through a server-side n8n webhook integration rather than direct browser calls.
- **FR-010**: The system MUST support the `draft_from_prompt` AI action in v1.
- **FR-011**: The system MUST validate and sanitize AI responses before showing them in the editor or allowing save.
- **FR-012**: The system MUST insert AI output into the editable form and MUST require explicit admin review before save or publish.
- **FR-013**: The system MUST store `aiChatId` with the blog post when the post originated from an AI draft.
- **FR-014**: The system MUST validate request payload shape before sending data to n8n or Strapi.
- **FR-015**: The system MUST limit AI prompt or request body size to prevent accidental oversized requests.
- **FR-016**: The system MUST keep Strapi API tokens and n8n webhook credentials on the server side only.
- **FR-017**: The system MUST return generic client-facing error messages while logging safe server-side details.
- **FR-018**: The system MUST log admin blog list, create, update, authorization-failure, AI-assist, and Strapi-write events safely without logging JWTs, Strapi tokens, webhook secrets, full AI prompts by default, or full unpublished drafts by default.
- **FR-019**: The system SHOULD include automated tests for authorization, payload validation, AI-response validation, slug behavior, and controlled failure handling.

### Key Entities *(include if feature involves data)*

- **Admin Blog Post**: A Strapi-backed blog entry managed through the admin UI, containing the public blog fields used by the site and optional AI draft linkage.
- **Blog Editor Payload**: The validated request body used to create or update a blog post through the admin API.
- **AI Assist Request**: The server-side request sent from the Next.js API layer to n8n for draft generation.
- **AI Assist Response**: The validated n8n response containing `aiChatId`, draft content, and optional notes.
- **Admin Authorization Context**: The verified JWT-derived user identity and role information used to permit or deny admin blog actions.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An authenticated admin can create and publish a new blog post through `/admin/blog` without direct browser access to Strapi credentials.
- **SC-002**: Anonymous and non-admin requests to covered admin blog API routes are rejected in 100% of verification cases.
- **SC-003**: An admin can request an AI draft, receive a validated editable result, and publish only after explicit manual review.
- **SC-004**: In verification runs for covered admin flows, zero sampled logs contain JWTs, Strapi tokens, n8n webhook secrets, or full unpublished blog drafts.
- **SC-005**: Existing public blog pages continue rendering existing and newly published posts after the feature is added.

## Assumptions

- The existing auth flow and JWT verification pattern remain in place and are reused for admin authorization.
- The app continues using Next Pages API routes for this feature to match the existing project style.
- The first version does not attempt to replace Strapi with a full in-app CMS.
- The n8n workflow itself is implemented separately; this feature defines and consumes the contract from the app side first.
- New posts can use sensible defaults for non-v1 editable fields such as authors, tags, and cover image until broader editor scope is added.
