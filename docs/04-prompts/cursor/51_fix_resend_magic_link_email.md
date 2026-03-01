Implement and harden real email delivery via Resend for gated resources magic-link flow.

GOAL
When a user requests access to a gated non-public resource, the system must send a REAL email via Resend containing a magic download link:
  {APP_BASE_URL}/resources/download?token=<PLAINTEXT_TOKEN>
Token validity: 24h
Token behaviour: multi-use until expiry
Tokens stored only as SHA-256 hash (never plaintext)

BUSINESS RULES (MUST HOLD)
- Public resources are always directly downloadable (ignore gated).
- Gated non-public resources show “Request access” and never expose /api/media/<file_id> in HTML.
- request-access creates request record + token record, then sends email.
- resend-access revokes old token and sends a new email if token expired/revoked (rate limited).
- In development (NODE_ENV=development): allow devMagicLinkUrl in JSON and console log magic link for testing.
- In production: never return devMagicLinkUrl; never log tokens; email is REQUIRED (if missing config -> return error).

WHAT TO DO (CODE CHANGES)
1) ENV VARS NORMALIZATION
- Standardize on:
  RESEND_API_KEY
  EMAIL_FROM   (exact name)
  APP_BASE_URL
- If code currently uses FROM_EMAIL or NEXT_PUBLIC_SITE_URL, implement safe fallback:
  - Prefer APP_BASE_URL
  - Else use NEXT_PUBLIC_SITE_URL
  - Else, in dev default to http://localhost:3000
  - In prod, missing base url must error.

2) RESEND EMAIL SERVICE
- Create a dedicated module (e.g. src/lib/email/resend.ts or similar) that exports:
  sendMagicLinkEmail({ to, resourceTitle, projectSlug, resourceKey, token, expiresAt })
- Use Resend official SDK if present; otherwise minimal fetch to Resend API.
- The function must:
  - Build the magic link from base url + token
  - Use subject: "Your download link: <Resource Title>"
  - Provide a clean HTML email:
    - short intro
    - “Valid for 24 hours”
    - “Works multiple times until it expires”
    - a button + fallback plaintext link
- Ensure FROM is EMAIL_FROM, and validate it exists.

3) API ROUTES INTEGRATION
- Update POST /api/resources/request-access:
  - After creating token record, call sendMagicLinkEmail
  - If RESEND_API_KEY missing:
    - dev: console log magic link + return ok + devMagicLinkUrl
    - prod: return 500 with explicit message that email config is missing
  - Response body:
    - dev: { ok:true, devMagicLinkUrl }
    - prod: { ok:true }

- Update POST /api/resources/resend-access:
  - After revoking/creating new token, send email same way
  - Same dev vs prod behaviour

4) SECURITY / LOGGING
- Never log plaintext token in production.
- Never include devMagicLinkUrl in production response.
- Ensure errors are consistent JSON:
  { ok:false, error:{ code, message } }
- Ensure rate limit errors return 429 with code RATE_LIMITED.

5) TESTS / REGRESSION
- Update or add minimal test instructions in docs (optional), but primarily ensure runtime correctness.
- Ensure existing flows remain:
  validate endpoint, download endpoint, landing page logic.

DELIVERABLES
- Code changes for env normalization
- Email sending module
- Updated request-access and resend-access routes to send email
- Safe dev fallback behaviour consistent with docs
- No token leaks in prod logs/responses

IMPORTANT
- Do not change the business logic of public vs gated visibility.
- Do not change token storage rules (hash only).
- Do not expose /api/media/<file_id> anywhere in UI for gated non-public.
- Keep multi-use behaviour unchanged.

After implementation, list files changed and explain briefly what changed.
