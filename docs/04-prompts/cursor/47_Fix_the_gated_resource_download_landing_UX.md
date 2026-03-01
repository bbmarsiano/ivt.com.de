You are working in a Next.js (App Router) project with Prisma + Postgres and Directus integration already set up.

Goal: Fix the gated resource download landing UX so it does NOT get stuck in a “downloading” spinner after the file downloads, and implement REAL email sending for both (1) request-access and (2) resend-access flows.

Context (current behavior/bug):
- /resources/download?token=... currently triggers a download automatically and shows a “downloading” state.
- Because the file is streamed (binary), the UI cannot reliably detect when the download finishes, so the spinner keeps spinning forever.
- We must change the approach so the landing page never uses fetch() to download the file stream. Instead it should validate first, then trigger a normal browser download (navigation/link), and stop the spinner immediately with a stable “Download started” state + fallback button.

Requirements:
A) Landing page logic (app/resources/download/page.tsx):
1) Parse token from query string.
2) Call a lightweight VALIDATION endpoint to check token status BEFORE triggering the download.
   - If valid: render a success UI and auto-start the download using a normal link navigation to /api/resources/download?token=...
   - Do NOT download the file via fetch().
   - After triggering the download, immediately transition state to “started” (no infinite spinner). Show:
     - Title: “Your download is starting…”
     - Body: “If it doesn’t start automatically, click the button below.”
     - Button: “Download file”
     - A secondary note: “This link works multiple times until it expires.”
3) If invalid/revoked: show an error UI (no resend).
4) If expired: show an expired UI with a “Resend link” action:
   - Input: email (optional if already known; if not stored, just request email)
   - Or simplest: allow resend using the expired token itself (backend will locate request_id from the token hash).
   - On submit: POST /api/resources/resend-access with { token } (or { token, email } if needed).
   - On success: show “A new link has been sent to your email. Check your inbox.” and stop there.
5) Handle rate-limit responses (429) gracefully in UI.

Implementation detail:
- Add a new API endpoint: GET /api/resources/validate?token=...
  - Returns JSON with status:
    { ok: true, status: "valid", filename, resourceKey, expiresAt }
    { ok: false, status: "expired" }
    { ok: false, status: "revoked" }
    { ok: false, status: "invalid" }
    { ok: false, status: "rate_limited" }
  - This endpoint must NOT stream the file. It only validates token hash and expiry, and returns status + metadata (filename optional).
- Landing page uses this validate endpoint to decide what to render and whether to auto-trigger download.

B) Real email sending:
We want to stop logging the magic link only, and actually send it by email in dev/prod (with a safe fallback to logging in dev if SMTP not configured).

1) Add an email utility: lib/email/sendEmail.ts
   - Use nodemailer with SMTP credentials.
   - Read env vars:
     SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, APP_BASE_URL
   - Provide sendMagicLinkEmail({ to, company, resourceKey, projectSlug, url, expiresAt })
   - Provide a nice plain-text + basic HTML email.
   - If SMTP is missing, in development log the URL instead of throwing.

2) Update POST /api/resources/request-access:
   - After creating the token, build the public landing URL:
     `${APP_BASE_URL}/resources/download?token=${token}`
   - Call sendMagicLinkEmail(...) with that URL.
   - Return { ok: true } (do NOT return the token to the client).

3) Update POST /api/resources/resend-access:
   - It already revokes old token and creates a new one.
   - It should send the new link via email using the same email utility.
   - Return { ok: true } (no token in response).
   - Keep rate limiting.

C) Security / best practices:
- Tokens are stored hashed in DB (already). Keep that.
- Never expose /api/media/<file_id> in HTML for gated non-public resources (already enforced). Keep that invariant.
- Validation endpoint must not leak sensitive info. Just status + minimal metadata.
- Ensure resend works only for expired tokens (or also revoked?), but not for “invalid”.
- Multi-use tokens remain valid until expires_at and can be used multiple times.
- Keep “request-access” forbidden for public resources (public resources are direct downloads and ignore gated).

D) Tests / verification:
- Provide updated docs section or add/extend docs/03-cms-directus/04-gated-resources-testing.md with new validate endpoint and the new expected UX states.
- Ensure TypeScript types and lint pass.

Deliverables:
1) New endpoint: app/api/resources/validate/route.ts
2) Email utility with nodemailer: lib/email/sendEmail.ts
3) Updated request-access endpoint to send email
4) Updated resend-access endpoint to send email
5) Updated landing page to validate first, then trigger normal download without infinite spinner
6) Update docs/testing instructions

Make the smallest changes that satisfy all requirements. Keep code consistent with existing patterns (logging prefix, error JSON shapes, etc.). Ensure all endpoints use safe parameterized Prisma queries (no string concatenation).

After implementation, list exact commands to test:
- Request access (POST)
- Validate (GET)
- Landing page open in browser
- Resend for expired token
- Confirm no infinite spinner

Proceed.
