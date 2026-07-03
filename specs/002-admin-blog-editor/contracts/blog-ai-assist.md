# Contract: Admin Blog API and AI Assist

## Admin blog API contract

The server exposes protected admin-only endpoints for:

- list blog posts
- create a blog post
- read a blog post for editing
- update a blog post
- request AI draft assistance

### Required behavior

- Every request is authorized server-side using the verified JWT and a server-resolved admin role check.
- Anonymous requests are rejected.
- Authenticated non-admin requests are rejected.
- Strapi credentials remain server-side.

## AI assist contract

The browser calls the app’s protected AI-assist endpoint, not n8n directly.

### Request shape

- `action`: `draft_from_prompt`
- prompt input
- optional current post context

### Response shape

- `success`
- `aiChatId`
- `draft`
- optional `notes`

### Required behavior

- The app validates the AI response before showing it in the editor.
- The app inserts the result into editable form state.
- The app does not auto-save or auto-publish AI output.
- The app keeps webhook credentials server-side only.

## Logging contract

Covered admin operations must log safe request lifecycle events, including authorization failures, AI-assist outcomes, and Strapi write outcomes, without exposing JWTs, secrets, or full unpublished content.
