Add a minimal internal admin page to view ProjectApplication records (read-only) to help development and validation.

Goals:
- Create /admin/applications page that lists recent applications from Postgres via Prisma.
- Protect it with a simple env-based access (no full auth yet):
  - Require a query param ?key=ADMIN_KEY
  - ADMIN_KEY stored in .env.local / .env
  - If key missing/wrong -> show 404 or "Not authorized".
- Keep UI clean (shadcn table), with filters:
  - status filter (pending_confirmation/confirmed/forwarded)
  - search by companyEmail or projectSlug
  - limit/pagination (simple: last 50)

Data shown per row:
- createdAt
- projectSlug
- companyName
- companyEmail
- status
- confirmedAt
- forwardedAt

Optional (nice-to-have, implement if easy):
- Button "Resend confirmation" for pending_confirmation:
  - generates new token + expiry + sends confirmation email again (respects RESEND_TEST_TO_EMAIL)
- Button "Resend forward" for confirmed (not forwarded):
  - sends coordinator email again and marks forwardedAt

Constraints:
- No Directus yet.
- No external auth libs yet.
- Do not expose ADMIN_KEY in client bundle (validate server-side).
- Keep project stable, typed, lint/typecheck passing.

Deliverables:
- /admin/applications page works locally.
- Document usage in APPLY_FLOW.md:
  - how to open (with ?key=...)
  - how to set ADMIN_KEY env
  - what actions exist
