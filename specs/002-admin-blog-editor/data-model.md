# Data Model: Admin AI-Assisted Blog Editor

## Admin Blog Post

Represents the Strapi-backed blog content editable through the admin UI.

**Fields**

- `title` (required)
- `slug` (optional if auto-generated)
- `excerpt` (optional but recommended)
- `date` (optional)
- `publishedAt` or equivalent publish state
- `isFeatured` (boolean)
- `aiChatId` (optional AI linkage)
- `coverImage` (preserved or defaulted in v1)
- `authors` (preserved or defaulted in v1)
- `tags` (preserved or defaulted in v1)
- `paragraphs` (repeatable structured content)

**Validation rules**

- `title` must be present.
- `paragraphs` must match the accepted Strapi rich-text structure for v1.
- Non-v1 editable fields must not be dropped accidentally during update.

## Blog Editor Payload

Represents the validated request body sent from the admin UI to create or update a blog post.

**Fields**

- editable blog fields from the admin form
- optional `id` for updates
- optional `publish` intent

**Validation rules**

- Must reject malformed rich text or oversized request bodies.
- Must not allow client-supplied authorization decisions.

## Admin Authorization Context

Represents the verified identity used to authorize admin blog operations.

**Fields**

- verified user identifier
- resolved user email or account reference from token verification
- role from MongoDB user lookup

**Validation rules**

- Authorization depends on verified JWT plus server-resolved role.
- Client-provided role state is ignored.

## AI Assist Request

Represents the server-side request sent to n8n.

**Fields**

- `action` set to `draft_from_prompt` in v1
- prompt input
- optional current post context
- site and requester context

**Validation rules**

- Prompt size must be bounded.
- Request must exclude raw webhook secrets from any client-visible path.

## AI Assist Response

Represents the validated result returned from n8n.

**Fields**

- `success`
- `aiChatId`
- `draft` with blog post draft fields
- optional `notes`

**Validation rules**

- `draft` must conform to the fields and rich-text shape accepted by the editor.
- Invalid or incomplete responses must be rejected before they reach save logic.
