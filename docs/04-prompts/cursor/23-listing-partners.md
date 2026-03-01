You are working in a Next.js 13.5 App Router project with Directus integration already proven for:
- Projects
- News
- Events
- Testimonials
All are server-fetched (force-dynamic, revalidate=0), with Framer Motion only in client wrappers.
Logging is active: [IVT][CMS] source=DIRECTUS ... fn=...

GOAL (Step 1/3): Add and fully integrate PARTNERS end-to-end (DB + Directus + frontend), matching the existing “Directus-first with mocks fallback” architecture.

IMPORTANT CONTEXT:
Right now Directus schema + DB migration are working for 4 CMS tables/collections.
Partners does NOT exist yet in the DB schema (or Directus metadata). We must add it safely.

REQUIREMENTS:

A) DATABASE (Postgres)
1) Create a new SQL migration file:
   db/migrations/2026-01-23_cms_partners.sql
2) It must create/alter the `partners` table to match the code-side Partner model we already have in mocks/types (1:1).
   - Use UUID primary key `id` (uuid, pk)
   - Include bilingual fields if the mocks/types do (e.g. name_de/name_en, description_de/description_en, etc.)
   - Include fields for logo / website / role / expertise if present in mocks/types
   - Add indexes/unique constraints as appropriate (e.g. slug unique if slug exists)
3) Ensure the migration is idempotent enough for local dev (avoid destructive drops unless clearly safe).

B) DIRECTUS (schema + metadata)
We need Directus to “see” the new DB columns so the UI shows proper fields.
Follow the SAME working approach used previously:
1) Ensure Directus has a `partners` collection with Primary Key = Generated UUID.
2) Ensure Directus fields are created/visible for all DB columns in `partners`.
3) If we already have scripts for applying schema snapshots / DB-driven field discovery, reuse them.
   - The previous REST-based /fields endpoints were inconsistent; the DB migration approach worked reliably.
4) Ensure permissions allow admin token + admin UI access (no FORBIDDEN).
   - Don’t change global auth model; just ensure the collection is accessible like the existing 4.

C) SEED
1) Update scripts/directus-seed-from-mocks.ts to also seed `partners` from the existing mock data (if mocks exist).
2) Use slug or stable key to upsert (update if exists, create if missing), same style as other collections.
3) Print a summary: created/updated counts.

D) FRONTEND INTEGRATION
1) Add Directus fetching for partners:
   - services/contentService.ts: add async methods:
     - getPartnersAsync() (or getAllPartnersAsync)
     - getFeaturedPartnersAsync(limit?: number) ONLY if the UI needs it
   - services/directusContentService.ts: implement Directus endpoints:
     - GET /items/partners?limit=...
     - Use fetch with cache: 'no-store'
     - Map Directus items to existing Partner type used by UI (1:1)
     - If logo is a Directus file UUID, map to `${DIRECTUS_URL}/assets/${id}`
2) Update the page/section that renders partners to use server fetch + client wrapper if needed:
   - Identify where partners are shown (likely /about or a Partners page/section).
   - Convert the route to server component if it currently fetches on client.
   - Use:
     export const dynamic = 'force-dynamic'
     export const revalidate = 0
   - Pass partners into a client component if motion/interactive UI exists.

E) LOGGING + PROOF
1) Ensure each partners fetch logs:
   [IVT][CMS] source=DIRECTUS url=... tokenLen=... fn=getPartnersAsync
2) If Directus is stopped, fall back to mocks and log:
   [IVT][CMS] source=MOCKS reason=... fn=getPartnersAsync

F) COMMANDS (include in final summary)
- Apply migration:
  psql "postgresql://dimitarmitrev@localhost:5432/ivt_dev" -v ON_ERROR_STOP=1 -f db/migrations/2026-01-23_cms_partners.sql
- Restart Directus:
  docker-compose -f docker/docker-compose.directus.yml restart
- Seed:
  npm run directus:seed
- Verify Directus API:
  curl -s -H "Authorization: Bearer $DIRECTUS_TOKEN" "http://localhost:8055/items/partners?limit=5" | jq
- Typecheck / lint / dev:
  npm run typecheck
  npm run lint
  npm run dev

ACCEPTANCE CRITERIA:
- Partners collection exists in Directus UI with all fields (not only id)
- Editing a partner field in Directus UI appears on the website after refresh (DEV)
- Terminal logs show [IVT][CMS] source=DIRECTUS ... fn=getPartnersAsync
- No Framer Motion server errors
- Mocks fallback still works when Directus is down