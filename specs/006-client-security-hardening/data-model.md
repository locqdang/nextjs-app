# Data Model: Client-Side Security Hardening

## Untrusted Content Value

Represents any string or object whose integrity is not guaranteed at render time.

**Sources**

- Strapi blog and SEO content
- HARO profile fields
- HARO pitches and query ingestion data
- Login and OAuth query parameters
- Google profile data
- Navigation data from CMS or config

## Rendering Context

Represents the browser context into which an untrusted value is placed.

**Variants**

- text node
- HTML attribute
- URL attribute
- redirect destination
- raw script / JSON-LD block
- authenticated API response
- log field

## Safe URL Candidate

Represents a value being considered for browser navigation.

**Allowed outputs**

- same-origin root-relative path
- fragment-only link
- explicit `http:` external URL
- explicit `https:` external URL
- `null` when unsafe or malformed

**Rejected shapes**

- `javascript:`
- `data:`
- `vbscript:`
- protocol-relative values such as `//evil.example`
- backslash-based path confusion
- malformed absolute URLs

## Safe Redirect Target

Represents the post-login path that may be used by login, verify-login, or Google sign-in flows.

**Rules**

- must begin with `/`
- must not contain backslashes
- must not be absolute or protocol-relative
- falls back to `/` when invalid

## Session Credential

Represents the authenticated browser session proving user identity.

**Current shape**

- signed JWT payload stored only in an HttpOnly cookie
- server reads the cookie through `readSession()`
- cookie includes `Path=/`, explicit `SameSite`, expiry, and `Secure` in production

## Security Header Policy

Represents the enforced browser response header baseline.

**Fields**

- `Content-Security-Policy`
- `Referrer-Policy`
- `X-Content-Type-Options`
- `X-Frame-Options`
- `Permissions-Policy`
- authenticated route cache policy (`Cache-Control`, `Pragma`)

## Logging Event

Represents a server-side auth or security log entry.

**Required properties**

- route
- operation
- request ID
- HTTP method
- hashed user identity when available

**Forbidden raw values**

- session cookies
- OAuth access or refresh tokens
- bearer tokens
- login links
- raw credentials
- full malicious payload samples when secret-shaped fields are present
