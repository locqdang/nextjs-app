# Quickstart: Admin AI-Assisted Blog Editor

## Prerequisites

- Application dependencies installed
- A working auth flow with an admin user in the user store
- Strapi access configured for blog create and update operations
- Environment variables configured for the app-side n8n integration when moving beyond mocked responses

## Validate admin access control

1. Log out and request an admin blog API route.
2. Confirm the route returns unauthorized.
3. Log in as a non-admin user and request the same route.
4. Confirm the route returns forbidden.
5. Log in as an admin user and confirm the route succeeds.

## Validate manual blog management

1. Open `/admin/blog` as an admin.
2. Confirm the blog list loads.
3. Create a new post using manual fields only.
4. Publish the post.
5. Edit an existing post and save changes.
6. Open the public blog page and confirm the published result renders correctly.

## Validate AI-assisted drafting

1. Open the create or edit form as an admin.
2. Submit a draft prompt through the AI assist action.
3. Confirm the result fills editable form fields rather than auto-saving.
4. Edit the AI output manually.
5. Save or publish only after explicit admin action.
6. Confirm `aiChatId` is stored for AI-originated posts.

## Validate safe error handling and logging

1. Simulate invalid payloads and AI-assist failures.
2. Confirm the client receives controlled generic errors.
3. Confirm logs contain safe operational context without JWTs, Strapi tokens, webhook secrets, or full unpublished drafts.
