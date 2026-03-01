The project already uses:

Next.js (App Router)

Directus CMS

/api/media/[fileId] proxy (working)

Resources fields:
key, title_en, type, file_id, external_url, gated, visible

M2M: resources ↔ projects

Categories including public

Implement a secure gated resource flow with magic-link download tokens.

0) Business Rules
Public Resources

Resources in category public must always be downloadable.

Ignore the gated flag for public resources.

If file_id exists → use /api/media/<file_id>

If no file_id → use external_url

Gated Project Resources

Gated behavior applies only to non-public project-specific resources.

These must NOT expose /api/media/<file_id> in the UI.

Instead, show a Request Access button.

1) Frontend UX

For gated resources:

Replace Download button with Request Access

Clicking opens a Modal form (NOT a new page)

Modal fields:

email (required, validate format)

company (required)

implicit: resourceKey

implicit: projectSlug

After submit:

Disable button + show loading state

On success:
Display:

“Thanks! We sent you an email with a download link. The link is valid for 24 hours.”

If token expired later:

Show:

“This link has expired. Request a new link.”

Button triggers same modal flow again.

2) Backend Endpoints (Next.js App Router)
A) POST /api/resources/request-access
Input JSON:
{
  "email": "user@example.com",
  "company": "ACME GmbH",
  "resourceKey": "ai-research-whitepaper",
  "projectSlug": "digital-health"
}

Logic:

Validate input.

Fetch resource from Directus by resourceKey.

If resource is public → return 400.

If resource has no file_id → return 400.

Validate resource belongs to the given project.

Apply rate limiting:

3 requests/hour per (email + resourceKey + projectSlug)

10 requests/hour per IP

Create access request record.

Generate secure token (see section 3).

Send email with download link:

http://localhost:3000/resources/download?token=<TOKEN>


For dev:

Log the link in console instead of sending real email.

Response:
{ "ok": true }

B) GET /api/resources/download?token=...
Logic:

Hash incoming token using SHA-256.

Find matching token_hash in DB.

If not found → 404

If expired or revoked → 410 { "error": "expired" }

If valid:

Increment use_count

Update last_used_at

Stream file to client

Use headers:

Content-Type

Content-Disposition: attachment

Token must be multi-use until expiry.

3) Token Model — Multi-Use Until Expiry

Requirements:

Generate random 32-byte token

Store only sha256(token) in DB

Token expires after 24 hours

Token is reusable until expiry

On each download:

Increment use_count

Update last_used_at

Add revoked_at column for future admin control

If user wants file again after expiry:

Endpoint returns 410

UI shows “Request new link”

User re-submits modal → new token issued

4) Database Tables

Create two tables:

resource_access_requests

id (uuid PK)

email

company

resource_key

project_id or project_slug

ip

user_agent

created_at

resource_access_tokens

id (uuid PK)

request_id (FK)

token_hash (unique)

resource_key

project_id or project_slug

file_id

expires_at

revoked_at

last_used_at

use_count (default 0)

created_at

Indexes:

token_hash (unique)

expires_at

(resource_key, project_id)

Add migration script.

5) CMS Integration

Update CMS layer logic:

When rendering resources:

If public:

Always allow direct download.

If gated AND not public:

Do NOT expose /api/media/...

Show Request Access.

6) Debug + Logging

Add logs:

[IVT][RESOURCES] request-access created token exp=...
[IVT][RESOURCES] download token ok use_count=...


Extend /api/debug/cms with:

shouldShowRequestAccess

isPublic

gated

7) Acceptance Criteria

Must verify:

Public resource downloads directly.

Gated resource shows Request Access.

Request access returns success and logs magic link.

Download link works.

Token works multiple times until expiry.

Expired token returns 410.

Gated resources never expose /api/media/<file_id> in HTML.