We already have the table public.resource_access_requests with BOTH columns:
- project_id (uuid)
- project_slug (text)

The POST /api/resources/request-access currently fails with:
ERROR: column "project_id" is of type uuid but expression is of type text

This means the endpoint (or its rate-limit query) is incorrectly using projectSlug (string) against project_id (uuid), or inserting projectSlug into project_id.

Please implement the minimal fix:

1) In POST /api/resources/request-access:
- Treat projectSlug as TEXT and store it ONLY into resource_access_requests.project_slug.
- Always store project_id as NULL (do not attempt to resolve slug -> UUID for now).
- Ensure the insert uses Prisma create OR a parameterized SQL query where project_id is explicitly NULL and project_slug is the payload string.

2) Fix rate limiting queries:
- Any lookup / count query that currently filters by project_id must instead filter by project_slug.
- The rate limit key should be (email + resourceKey + project_slug) when project_slug is provided.
- If projectSlug is missing, rate limit by (email + resourceKey) and IP separately (keep existing IP limit).

3) Ensure safe parameter usage:
- No string concatenation in raw SQL.
- If using prisma.$queryRaw, use template literal parameter binding.

4) Add a small dev log:
- Log { email, resourceKey, projectSlug } and confirm which DB columns are being used (project_slug vs project_id).

5) After changes:
- `curl -X POST /api/resources/request-access ...` must return { ok: true } and print a dev magic link token.
- Typecheck and lint pass.

Do NOT change the database schema/migrations, since project_slug already exists.
