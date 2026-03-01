Fix build error: "Module not found: Can't resolve '@react-email/render'" coming from resend SDK usage.

Goal:
- Remove dependency on @react-email/render entirely.
- Send emails via Resend using plain HTML + text strings.
- Ensure /api/applications works and writes to DB before sending email.
- Keep existing behavior and messages.

Tasks:
1) Update lib/emails/templates.ts:
   - Export functions that return { subject: string; html: string; text: string } for:
     a) applicant confirmation email
     b) coordinator forward email
   - Use simple, clean HTML (no React-email components).

2) Update lib/emails/resend.ts:
   - Use Resend SDK with:
     resend.emails.send({ from, to, subject, html, text })
   - Do NOT import or use @react-email/render.
   - Add clear error handling (throw with safe message, no PII logs).

3) Ensure /app/api/applications/route.ts:
   - Creates DB record first.
   - Then attempts to send confirmation email.
   - If email sending fails, keep the DB record and return a user-friendly error response (e.g., 500 with message "Email service unavailable. Please try again later.").
   - Do not expose internal errors.

4) Ensure /app/api/applications/confirm/route.ts:
   - Similar: update DB status to confirmed first, then try forwarding email, then set forwarded.
   - If forwarding email fails, keep status confirmed (not forwarded) and return a friendly error, and document in APPLY_FLOW.md how to re-forward later (we can add an admin endpoint later).

5) Dependencies:
   - If @react-email/render was added anywhere, remove it (we won't use it).
   - Make sure the project compiles and `npm run dev` works.

Deliverable:
- No build error.
- Submit Apply hits API, inserts a row in ProjectApplication.
- Confirmation email sending works with HTML/text.
- Provide a summary of changed files.
