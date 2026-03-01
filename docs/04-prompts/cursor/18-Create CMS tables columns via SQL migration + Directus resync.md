You are working in the Next.js repo ivt.com.de. We have Directus running against the same Postgres database ivt_dev. Right now the CMS tables exist but only contain a uuid primary key `id` and no other columns:

public.projects(id uuid pk)
public.events(id uuid pk)
public.news(id uuid pk)
public.testimonials(id uuid pk)

Directus can access /fields/projects and only sees the `id` field. We need to create the FULL set of columns 1:1 with the current code schema snapshot used by our Directus scripts (directus/snapshots/ivt-schema.from-code.json). Do NOT change any existing Prisma tables (ProjectApplication, _prisma_migrations) or any directus_* system tables.

TASK:
1) Add a new SQL migration file at:
   db/migrations/2026-01-22_cms_tables.sql

2) The migration must:
   - Add all missing columns to the four tables projects/events/news/testimonials to match the existing code schema used in scripts.
   - Use Postgres-native types:
     - text/varchar for strings
     - boolean for flags
     - timestamptz for date/time fields
     - jsonb for tags/metrics/documents/images arrays/objects (we will store structured data in jsonb)
   - Add reasonable defaults where needed (e.g. featured default false, status default 'ongoing' where applicable)
   - Add UNIQUE index for slug fields (projects.slug, news.slug, events.slug)
   - Add indexes for frequently queried fields:
       projects.status, projects.industry, projects.featured
       news.published_at
       events.start_at
       testimonials.featured
   - Do not create any foreign keys to directus_files right now (we can add later). Keep file fields as nullable jsonb or text placeholders.

3) Also add a small bash helper script:
   scripts/db-apply-migration.sh
   - It should apply this migration to DATABASE_URL from .env.local (or .env)
   - Must be safe: prints what it will run, aborts if file missing
   - Uses `psql "$DATABASE_URL" -f ...`

4) Update documentation:
   docs/03-cms-directus/02-schema.md
   - Explain why we added DB columns first (Directus introspection)
   - Provide commands:
       bash scripts/db-apply-migration.sh
       docker-compose -f docker/docker-compose.directus.yml restart
       curl -s -H "Authorization: Bearer $DIRECTUS_TOKEN" http://localhost:8055/fields/projects | jq '.data | length'

5) After migration, update our directus export/diff scripts to use /fields/{collection} endpoint only (do NOT use /fields?filter=...).
   Specifically:
   - scripts/directus-export-current-schema.js should fetch fields via GET /fields/{collection}
   - scripts/directus-apply-schema-from-code.js should NOT attempt to create columns anymore; only ensure Directus metadata exists once DB has columns.
   This means: remove any code trying to POST /fields to create DB columns, and instead only create metadata if missing using Directus endpoints appropriate for v11.
   If that is too risky, at minimum: guard these scripts so they do not try to create DB columns and do not error if the columns exist.

ACCEPTANCE:
- Running the migration creates the missing columns (verify with \d+ public.projects shows many columns).
- After restarting Directus, GET /fields/projects returns > 1 field.
- No changes to ProjectApplication or directus_* tables.
- No breaking changes to Next.js app build.
