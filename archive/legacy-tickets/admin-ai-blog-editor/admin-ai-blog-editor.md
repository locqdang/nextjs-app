# Admin AI-Assisted Blog Editor

## Context

The site currently renders blog posts from Strapi at `/blog` and `/blog/[slug]`.

Current implementation notes:

- Public blog routes are in `src/app/blog/page.tsx` and `src/app/blog/[slug]/page.tsx`.
- Blog read/normalization logic is in `src/lib/blog-posts.js`.
- Strapi helpers already support `GET`, `POST`, `PUT`, and `DELETE` in `src/lib/data/strapi.js`.
- Authentication stores a JWT in `localStorage`; API routes verify the bearer token server-side.
- Admin role convention already exists in MongoDB `users.role === 'admin'`, checked from `src/lib/data/mongodb.js`.
- Existing blog content includes fields currently rendered by the UI: `title`, `slug`, `excerpt`, `date`, `isFeatured`, `coverImage`, `authors`, `tags`, and `paragraphs` with `title`, `richText`, and optional `ParagraphMedia`.

## Goal

Allow an admin user to create a new blog post and edit existing blog posts from the Vietpolyglots admin UI, with AI assistance implemented through n8n webhooks for now.

## Proposed Scope

### In scope

1. Add protected admin-only blog management pages.
2. Let admins list current blog posts.
3. Let admins create a draft/new blog post.
4. Let admins edit existing blog post fields used by the public blog UI.
5. Let admins request AI assistance through an n8n webhook.
6. Let admins review and edit AI output before saving to Strapi.
7. Save approved blog post changes to Strapi through server-side API routes.
8. Allow admins to publish blog posts directly from the admin UI in v1.
9. Log server-side failures safely without logging JWTs, webhook secrets, or full unpublished drafts.

### Out of scope for first version

- Building an in-app full WYSIWYG CMS that replaces Strapi.
- Image upload/media library management.
- Cover image, author, and tag management in the v1 editor.
- Publishing workflow with multi-user approvals.
- Automatic publishing without admin review.
- Replacing n8n with direct OpenAI/LLM calls in this app.
- Non-admin author permissions.

## Users and permissions

### Admin

An admin can:

- open the blog admin area
- view existing blog posts
- create a blog post draft
- edit blog post fields
- ask AI to generate a full draft from a prompt through n8n
- review AI output
- save and publish the final post to Strapi

### Non-admin authenticated user

A non-admin user must not be able to:

- open blog admin pages
- list all posts through admin endpoints
- create or update blog posts
- call the n8n blog assistant endpoint through the app

### Anonymous user

Anonymous users can only read public blog pages.

## Suggested routes

### UI routes

```txt
/admin/blog
/admin/blog/new
/admin/blog/[documentId-or-id]/edit
```

The `/admin` route family should be protected client-side for UX and server-side in API routes for actual security.

Decision: `/admin/blog` is the desired admin blog URL.

### API routes

```txt
GET  /api/admin/blog/posts
POST /api/admin/blog/posts
GET  /api/admin/blog/posts/:id
PUT  /api/admin/blog/posts/:id
POST /api/admin/blog/ai-assist
```

Implementation can use Next Pages API routes to match the existing project style:

```txt
src/pages/api/admin/blog/posts/index.js
src/pages/api/admin/blog/posts/[id].js
src/pages/api/admin/blog/ai-assist.js
```

## Data model requirements

The editor should support the fields the public UI already renders:

- `title` — required
- `slug` — optional; can auto-generate from title if blank
- `excerpt` — optional but recommended for cards and metadata
- `date` — optional; defaults to today or Strapi publish date depending final decision
- `publishedAt`/publish state — v1 should allow publishing directly, not draft-only saves
- `isFeatured` — boolean
- `aiChatId` — string/id stored with the Strapi blog post so the related n8n-side AI history can be found later
- `coverImage` — not editable in v1; keep existing value when editing and leave unset/default when creating
- `authors` — not editable in v1; use default author for new posts and keep existing authors when editing
- `tags` — not editable in v1; use defaults/no tags for new posts and keep existing tags when editing
- `paragraphs` — repeatable content sections containing:
  - `title` — optional section heading
  - `richText` — Strapi rich text blocks
  - `ParagraphMedia` — optional existing media block; can be out of first version if media selection is not ready

## AI assistance requirements

AI assistance should be mediated by n8n, not direct LLM calls from this Next.js app.

Decision: the n8n workflow is **not implemented yet**. The Next.js work should define and mock the webhook contract first, then connect to the real n8n webhook after that workflow exists.

### Proposed n8n flow

```txt
Admin editor -> Next.js API route -> n8n webhook -> AI workflow -> Next.js API response -> Admin reviews -> Save to Strapi
```

The app should not let the browser call the n8n webhook directly. The server-side API route should hold the webhook URL/secret.

### Environment variables

Proposed variables:

```txt
N8N_BLOG_ASSIST_WEBHOOK_URL=
N8N_BLOG_ASSIST_WEBHOOK_SECRET=
```

Do not hardcode webhook URLs or secrets.

### AI action for first version

Decision: v1 supports `draft_from_prompt` only.

Other actions such as `rewrite_selection`, `generate_outline`, and `seo_suggest` can be added later after the create/edit flow is stable.

### Proposed request body to n8n

```json
{
  "action": "draft_from_prompt",
  "input": {
    "prompt": "Write a practical blog post about...",
    "tone": "plain language, practical, Vietpolyglots voice",
    "targetAudience": "language learners, developers, and small business operators",
    "currentPost": null
  },
  "context": {
    "site": "vietpolyglots.com",
    "requestedBy": {
      "userId": "server-derived user id",
      "userHash": "safe hashed identifier"
    }
  }
}
```

### Proposed n8n response body

```json
{
  "success": true,
  "aiChatId": "n8n-chat-or-execution-id",
  "draft": {
    "title": "...",
    "slug": "...",
    "excerpt": "...",
    "tags": ["..."],
    "paragraphs": [
      {
        "title": "...",
        "richText": [
          {
            "type": "paragraph",
            "children": [{ "type": "text", "text": "..." }]
          }
        ]
      }
    ]
  },
  "notes": ["Optional explanation for the admin"]
}
```

Decision: n8n returns Strapi rich text JSON directly. The Next.js app should validate/sanitize this response before showing it or allowing save; it should not need to convert Markdown/plain text to Strapi rich text for v1.

Decision: AI prompt/draft history is stored in n8n. The Strapi blog post stores `aiChatId` so the n8n history can be linked later. The Next.js app should not duplicate full prompt/draft history in MongoDB or Strapi for v1.

## UX requirements

### Blog list page

`/admin/blog` should show:

- title
- slug
- date/published date
- featured status
- edit link
- create new post button

### Create/edit form

The first version can use practical form controls rather than a polished CMS editor:

- title input
- slug input
- excerpt textarea
- date input
- featured checkbox
- paragraphs editor with add/remove/reorder if feasible
- AI prompt textarea/button
- preview area for AI output
- hidden/read-only `aiChatId` association after AI draft generation
- save/publish button

AI output must be inserted into the editable form, not auto-saved.

### User feedback

Show clear statuses:

- loading posts
- requesting AI draft
- AI request failed
- saving draft/post
- save succeeded
- save failed

## Security requirements

- Verify JWT server-side in every `/api/admin/blog/*` route.
- Derive user identity from the verified JWT, not from request body fields.
- Load the user from `nextjs_db.users` via `src/lib/data/mongodb.js` and require `role === 'admin'`.
- Never trust client-side `user.role` for authorization.
- Do not expose Strapi API tokens to the browser.
- Do not expose n8n webhook URL/secret to the browser.
- Validate request body shape before sending to n8n or Strapi.
- Limit AI prompt/body sizes to prevent accidental huge requests.
- Return generic error messages to the client; log safe server-side details.

## Logging/observability requirements

Log these server-side events safely:

- admin blog list/create/update request started/completed
- unauthorized/forbidden admin access attempts without plain JWT or full email
- n8n AI assist request success/failure
- Strapi create/update success/failure

Do not log:

- JWTs
- Strapi tokens
- n8n webhook secrets
- full AI prompts by default
- full unpublished blog drafts by default

Use existing `createApiLogger`, `logger`, and `serializeError` conventions.

## Testing plan

### Unit tests

Add tests for:

- admin JWT/user-role helper
- blog payload validation/normalization
- n8n response validation
- slug generation behavior if reused/extended

### API tests

Add tests for:

- anonymous request gets `401`
- authenticated non-admin gets `403`
- admin can list posts
- admin can create post with valid payload
- admin can update post with valid payload
- invalid payload gets `400`
- n8n failure returns controlled error

Mock Strapi and n8n network calls; do not send real webhook calls in tests.

## Implementation phases

1. Build admin blog create/edit UI and API with mocked n8n response fixtures.
2. Define the n8n webhook contract and sample payloads from the app side.
3. Implement the n8n workflow separately.
4. Connect the app to the real n8n webhook URL/secret and run an end-to-end manual test.

### Manual checks

- Login as admin.
- Open `/admin/blog`.
- Create and publish a post via manual fields.
- Create a full draft via AI prompt, review/edit it, then publish.
- Edit an existing post and confirm public `/blog/[slug]` reflects the change after revalidation/cache behavior.
- Login as non-admin and confirm admin pages/API routes are blocked.

## Deployment/configuration notes

Before deployment, production needs:

```txt
N8N_BLOG_ASSIST_WEBHOOK_URL
N8N_BLOG_ASSIST_WEBHOOK_SECRET
STRAPI_API_TOKEN with create/update permission for blog-posts
```

Confirmed v1 publishing behavior: admins should be able to publish directly. During implementation, inspect the Strapi version/API behavior and use the correct `publishedAt`/publish endpoint semantics.

## Open questions for Loc

1. What default author should new posts use, and is it a Strapi author ID/documentId?
2. What exact Strapi field name/type should store `aiChatId`?
3. Does the existing Strapi `blog-post` content type have draft/publish enabled, and does publishing require `publishedAt` or a dedicated publish endpoint in the deployed Strapi version?
4. Should the v1 editor expose a separate “Save unpublished changes” action, or only “Publish”?
5. What n8n auth style should the webhook use: bearer secret header, custom header, or query token?

## Acceptance criteria

- Admin can access a protected blog management page.
- Non-admin and anonymous users cannot access admin blog API routes.
- Admin can create a blog post without exposing Strapi credentials to the browser.
- Admin can edit an existing blog post without exposing Strapi credentials to the browser.
- Admin can request AI help through a server-side n8n webhook proxy.
- Admin can generate a full draft from a prompt through n8n.
- AI output is reviewable/editable before save; it is never auto-published without admin action.
- Published posts store `aiChatId` when they came from an n8n AI draft.
- V1 does not require cover image, author, or tag editing in the admin UI.
- Public blog rendering continues to work for existing posts.
- Tests cover authz, validation, Strapi write calls, and n8n failure handling.
- Production config is documented before deployment.
