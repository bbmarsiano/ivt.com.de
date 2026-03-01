We hit Resend testing limitation:
"You can only send testing emails to your own email address (bbmarsiano@gmail.com)..."

Goal:
Make dev/testing work end-to-end without a verified domain by routing outbound emails to a configured test inbox.

Tasks:
1) Add env var support:
- In .env.example add:
  RESEND_TEST_TO_EMAIL=
- In lib/env.server.ts add reader for RESEND_TEST_TO_EMAIL (optional).

2) Update email sending utility (lib/emails/resend.ts):
- Add a helper to resolve recipient:
  - If RESEND_TEST_TO_EMAIL is set, use it as the `to` address for ALL outgoing emails in development.
  - Keep the original intended recipient in the email body (e.g. "Intended recipient: ...") for debugging.
- Also, if Resend returns the specific validation error about testing emails, catch it and retry sending to RESEND_TEST_TO_EMAIL (if configured).
- Log a safe message indicating override is active (no PII beyond the test inbox).

3) Update /api/applications route:
- If email send succeeds (either normal or dev override), return success as before.
- Do not return "Email service unavailable" for this known testing restriction if RESEND_TEST_TO_EMAIL is configured; treat it as success.

4) Update docs:
- APPLY_FLOW.md: add section "Resend testing mode" explaining:
  - set RESEND_TEST_TO_EMAIL to your own email while no domain is verified
  - once domain is verified, remove RESEND_TEST_TO_EMAIL and set FROM_EMAIL to your domain sender

Constraints:
- Do not change UI message text.
- Keep behavior identical for production (when RESEND_TEST_TO_EMAIL not set).

Deliverable:
- Apply submit sends confirmation email to RESEND_TEST_TO_EMAIL successfully in dev.
- Confirmation link flow continues to work.
