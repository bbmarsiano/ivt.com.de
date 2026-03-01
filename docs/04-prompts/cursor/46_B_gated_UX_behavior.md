You are working in a Next.js (App Router) project with Directus integration and an existing gated flow:
- POST /api/resources/request-access (creates request + token, stores token hash, expires in 24h, rate limits)
- GET /api/resources/download?token=... (validates token, streams file, multi-use until expiry)
- UI uses a RequestAccessModal for gated resources
- Public resources are always downloadable (ignore gated flag)

Now implement “B: gated UX/behavior” end-to-end.

GOALS / REQUIREMENTS
1) Public resources:
   - If resource is public (has category "public"), ALWAYS show a direct “Download” button.
   - Ignore `gated` for public resources (even if gated=true).
   - Direct download behavior:
     - If file_id exists -> link to /api/media/<file_id>
     - Else fallback to external_url
   - This must apply both on Public Resources listings and Project Resources sections.

2) Project-specific gated resources:
   - If resource is NOT public and gated=true:
     - NEVER expose /api/media/<file_id> in HTML, props, or JSON sent to the client.
     - Show “Request access” button.
     - Clicking opens a modal with: email + company (required), and an optional privacy note.
     - On submit -> POST /api/resources/request-access with { email, company, resourceKey, projectSlug }.
     - Show success state: “Check your email — link valid for 24 hours” (explicitly say multi-use until expiry).
   - If gated=false (and not public), show normal Download (file_id => /api/media, else external_url).

3) Magic link landing UX:
   - Email link should be a user-friendly page URL: /resources/download?token=...
   - Create a new page route: app/resources/download/page.tsx (or equivalent) that:
     - Reads token from query string.
     - Immediately attempts to start download by redirecting to /api/resources/download?token=...
     - BUT if the API responds with an error (e.g., 410 expired, 404/401 invalid, 429 rate limited),
       show a nice UI with:
         - Status message (Expired / Invalid / Revoked / Too many requests / Generic error)
         - For expired tokens: allow user to request a new link (“Send a new link”).
         - For invalid tokens: show generic message and a link to Contact.
     - Important: do not leak file URLs; downloads must always happen via /api/resources/download token endpoint for gated resources.
   - The page can implement a two-step approach:
     (a) First call a lightweight JSON endpoint to validate token state
     (b) If valid -> redirect to /api/resources/download?token=...
     (c) If expired -> show resend UI

4) Resend / expired handling (multiple-use to expiry):
   - Add endpoint: POST /api/resources/resend-access
     - Input: { token } (from the expired link)
     - Server finds the token row by hash (even if expired), joins request row to get email, company, resource_key, project_slug.
     - Generate a NEW token (24h), store hash, link to same request_id (or create a new request row; pick a clean approach and be consistent).
     - Optionally revoke the old token (set revoked_at) to reduce clutter.
     - Return ok:true in dev and log the new /resources/download?token=... URL.
     - Rate limit resend by IP and by request_id (e.g., 3/hour).
   - Update the download landing page to call this endpoint for expired tokens and show “Email sent” message.

5) UI polish / behavior:
   - On Project page resources list:
     - For public: show “Download” always.
     - For gated: show “Request access” (opens modal) and a “Locked” badge.
     - For non-gated: show “Download”.
   - Ensure link opening behavior:
     - For external_url type LINK: open in a new tab and show an external icon.
     - For file downloads: normal download (same tab ok).
   - Ensure consistent “type” display (PDF/PPT/LINK) if available; otherwise infer from file extension (only for display).

6) Security & best practices:
   - Do not reveal whether an email exists.
   - Avoid user enumeration via token validation: token itself is secret, but keep error messages not overly detailed for invalid tokens.
   - Keep rate limits.
   - Never store plaintext tokens; only hashes.
   - Ensure CSP-safe UI; no inline scripts.
   - Add unit-ish checks or lightweight debug output in /api/debug/cms showing:
     - isPublic, shouldShowRequestAccess, downloadUrlVisible (boolean) for each resource.

IMPLEMENTATION NOTES
- Use existing helper functions if present (isResourcePublic, shouldShowRequestAccess, getResourceLinkProps).
- Keep server-only logic in route handlers.
- Prefer simple, reliable code over fancy abstractions.
- Make sure TypeScript passes, lint passes.

DELIVERABLES
- New page: /resources/download (UI landing)
- New API endpoint: POST /api/resources/resend-access
- Updates to resource mapping so gated non-public never exposes direct file URL
- Updates to Project resources UI to follow rules above
- Update dev logging to print /resources/download?token=... links (not /api/... links)

After implementing, provide a short “How to test” checklist with curl commands and manual browser steps.
