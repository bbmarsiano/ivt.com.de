You are working in a Next.js (App Router) project that currently implements:
- Gated resource access via magic-link tokens
- Endpoints:
  - POST /api/resources/request-access
  - POST /api/resources/resend-access
  - GET  /api/resources/validate
  - GET  /api/resources/download (streams file)
- Landing page: /resources/download?token=...
- Email utility: lib/email/sendEmail.ts currently uses nodemailer (and requires installing nodemailer).

Goal:
Switch email delivery to Resend (https://resend.com) and REMOVE the nodemailer dependency, WITHOUT changing any existing runtime behavior, token logic, endpoints behavior, or UI flows. Only replace the email transport implementation.

Hard constraints:
- Do NOT change token generation, DB schema, rate limiting, validation, download streaming, or UI logic.
- Do NOT change endpoints’ request/response shapes.
- Keep the current dev fallback behavior: if email provider env vars are missing, log the magic link URL in development instead of throwing; in production, fail gracefully with a clear error.
- Keep emails: both plain text + HTML.
- Preserve subject + email content meaning (magic link, expiry notice, multi-use until expiry).
- Ensure resend-access sends the new token link (not the old one).

Implementation requirements:
1) Replace lib/email/sendEmail.ts to use Resend:
   - Use the official Resend SDK.
   - Env vars:
     - RESEND_API_KEY (required to send)
     - EMAIL_FROM (e.g. "IVT <noreply@yourdomain.com>")  (or reuse SMTP_FROM if already used, but prefer EMAIL_FROM)
     - APP_BASE_URL (already used)
   - Keep the exported function signature:
     - sendMagicLinkEmail({ to, company, resourceKey, projectSlug, url, expiresAt })
     - Return a success object (or void) consistent with the current callers.
   - If RESEND_API_KEY is missing:
     - In development: console.log the URL (existing behavior) and return ok.
     - In production: return an error (or throw) but make sure endpoints respond with a safe JSON error and do not leak sensitive data.
   - Implement email sending with Resend:
     - resend.emails.send({ from, to, subject, html, text })
   - Basic HTML template is fine. Include:
     - A button link to the landing URL
     - Expiry timestamp mention (“valid for 24 hours”)
     - Multi-use until expiry note
2) Update package dependencies:
   - Add `resend` dependency if not present.
   - Remove `nodemailer` and `@types/nodemailer` if they were added.
3) Ensure endpoints still behave identically:
   - POST /api/resources/request-access still returns { ok: true } if DB insert + token creation succeeded.
   - POST /api/resources/resend-access still returns { ok: true } if new token creation succeeded.
   - If email sending fails in development, it should still return { ok: true } (log fallback).
   - If email sending fails in production, return { ok: false, error: "EMAIL_SEND_FAILED" } (or existing error shape), but do NOT expose the token.
   - Keep terminal logging in dev if present.
4) Update docs:
   - docs/03-cms-directus/04-gated-resources-testing.md should mention Resend env vars and remove SMTP/nodemailer steps.
   - Add a short section “Resend setup” with required envs and what to expect in dev fallback.

Make minimal diffs:
- Only touch lib/email/sendEmail.ts, package.json/lock files, and docs.
- Do not modify API routes except to adapt to new sendEmail return type if needed, but keep responses identical.

After implementation:
- Ensure `npm run typecheck` and `npm run lint` pass.
- Provide a short list of manual test commands (request-access, resend-access) and what should appear (email received if configured; URL logged if not).

Proceed with these changes now.
