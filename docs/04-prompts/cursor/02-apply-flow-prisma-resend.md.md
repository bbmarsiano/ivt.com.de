Implement the real project application flow (double opt-in) in this Next.js App Router + TypeScript project.

We have local PostgreSQL running. Use Prisma. Do NOT integrate Directus yet.

Key requirement: minimize Resend risk.
- Add FROM_EMAIL as an env var.
- Use a safe default FROM_EMAIL that Resend accepts in development (document it).
- Allow development mode to still work even if domain is not verified yet.
- Do not expose coordinator emails on the client.

1) ENV
- Ensure .env.example includes:
  DATABASE_URL=
  RESEND_API_KEY=
  FROM_EMAIL=
  NEXT_PUBLIC_SITE_URL=
- Add a server-only env helper (lib/env.server.ts) to read DATABASE_URL, RESEND_API_KEY, FROM_EMAIL.
- Add a client env helper (already exists) for NEXT_PUBLIC_SITE_URL.
- Provide a clear error message server-side if RESEND_API_KEY missing when attempting to send.

2) Prisma setup
- Install deps: prisma, @prisma/client, pg, zod.
- Initialize Prisma if not present.
- Create schema.prisma with:
  enum ApplicationStatus { pending_confirmation confirmed forwarded }

  model ProjectApplication {
    id                     String   @id @default(uuid())
    projectSlug             String
    status                  ApplicationStatus @default(pending_confirmation)
    companyName             String
    companyEmail            String
    companyWebsite          String
    contactPerson           String
    contactDetails          String
    message                 String
    confirmationToken       String   @unique
    confirmationExpiresAt   DateTime
    confirmedAt             DateTime?
    forwardedAt             DateTime?
    coordinatorEmail        String
    createdAt               DateTime @default(now())
    updatedAt               DateTime @updatedAt
  }

- Create and run migration.

3) Input validation (server)
- Create a Zod schema for application input:
  companyName, companyEmail (email), companyWebsite (url), contactPerson, contactDetails, message, projectSlug.
- Add a honeypot field: website2 (optional). If filled => reject silently with 200 OK (to deter bots).
- Add minimal rate limit by IP for POST /api/applications (in-memory map; good enough for dev, document limitations).

4) Coordinator email resolution (server only)
- For now, resolve coordinatorEmail from existing mock projects data via contentService.getProjectBySlug(slug).
- Make sure this lookup happens server-side only.
- If coordinator email is missing, fallback to a dev env var COORDINATOR_FALLBACK_EMAIL (optional) or throw a server error.

5) API routes (App Router)
A) POST /api/applications
- Parse JSON, validate with Zod.
- Apply honeypot + rate limit.
- Create ProjectApplication with:
  status=pending_confirmation
  confirmationToken = crypto.randomUUID()
  confirmationExpiresAt = now + 48h
  coordinatorEmail = resolved email
- Send confirmation email to applicant via Resend.
  - Confirmation link: `${NEXT_PUBLIC_SITE_URL}/apply/confirm?token=...` (prefer a page route), OR use an API confirm endpoint but must end in a user-friendly page.
- Return JSON success that matches existing UI expectations.

B) Confirmation page route (preferred):
- Create /apply/confirm/page.tsx that reads token from searchParams and calls a server action or fetches an internal API to confirm.
- Show states: loading, success, invalid/expired.

C) Server confirm handler:
- Implement POST /api/applications/confirm (or GET) that:
  - validates token
  - checks expiry
  - updates status to confirmed + confirmedAt
  - sends a "forward" email to coordinatorEmail with all application details
  - updates status to forwarded + forwardedAt (only after forward email succeeds)
  - returns success

6) Email sending
- Use the official Resend SDK.
- Templates:
  - Applicant confirmation email (DE+EN minimal; can be English-only for dev but structure should allow i18n later)
    Subject: "Confirm your application – Innovation Valley Thüringen"
    Include confirm link and summary.
  - Coordinator forward email
    Subject: "New confirmed project application: {projectSlug}"
    Include all fields.
- Use FROM_EMAIL from env.
- Document recommended dev FROM_EMAIL and how to switch once domain is verified.

7) Frontend wiring
a) ApplyModal
- Replace the simulated submit with real fetch POST /api/applications.
- Keep exact success message text:
  "Email been send for application confirmation. Please confirm by click on the link in the email"
- On error: show a translated, user-friendly error message (no stack traces).
- Keep existing client-side validators, but server must still validate.

8) Docs
- Add APPLY_FLOW.md with:
  - DB schema
  - endpoints
  - env vars
  - dev testing steps
  - production notes (rate-limit, domain verification)
- Update PROJECT_READY_FOR_CURSOR.md accordingly.

Constraints:
- Do NOT integrate Directus yet.
- Do NOT break existing pages or intro overlay.
- Keep code typed and clean.

Deliverable:
- End-to-end works locally:
  - Apply submit writes to DB and sends confirmation email
  - Clicking confirm link confirms + forwards to coordinator email
  - DB statuses update correctly
- Provide a short list of files changed/added.
