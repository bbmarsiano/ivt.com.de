We confirmed via psql \dt that there are NO physical tables for projects/events/news/testimonials in Postgres.
Only Directus system tables exist. So the CMS collections are currently broken meta-only entries.

Goal:
- Remove broken CMS collection metadata (projects, events, news, testimonials) from Directus.
- Recreate them properly so Directus creates physical tables and fields.
- Preserve Prisma tables: ProjectApplication and _prisma_migrations.
- Ensure UUID primary keys.

Tasks:
1) Create script: scripts/directus-hard-reset-meta.js
- Auth via DIRECTUS_TOKEN if present (else login).
- For each CMS collection in code snapshot (projects, events, news, testimonials):
  a) Attempt DELETE /collections/{name}
     - treat 204 as success
     - if 404, ignore
  b) Also delete any leftover field metadata:
     - GET /fields/{name} (if accessible) and delete fields (best-effort)
     - If /fields is 403, continue
  c) Delete any stale rows in directus_collections/directus_fields via Directus endpoints if supported
     (do not access DB directly)
- Verify each collection is gone from GET /collections (list)

2) Fix scripts/directus-apply-schema.js to guarantee physical table + fields creation.
Important:
- Use REST endpoints only:
  - POST /collections to create collection
  - POST /fields/{collection} to create each field
- Ensure correct schema payloads so Directus creates real DB tables.
- Explicitly create id as UUID primary key:
  - field: id
  - type: uuid
  - schema: { is_primary_key: true, is_nullable: false, has_auto_increment: false }
- After creating a collection, immediately verify:
  - GET /fields/{collection} returns non-zero fields
  - If not, throw a clear error.

3) Update scripts/directus-apply-schema.sh:
- If DIRECTUS_RESET=1:
  - run node scripts/directus-hard-reset-meta.js
  - then run node scripts/directus-apply-schema.js

4) Update docs:
- directus/README.md:
  - "Broken meta-only collections recovery" section
  - commands to run reset+apply
  - verification with curl /fields/projects

Acceptance:
After running:
  DIRECTUS_RESET=1 ./scripts/directus-apply-schema.sh
These must succeed:
  curl -s -H "Authorization: Bearer $DIRECTUS_TOKEN" http://localhost:8055/fields/projects | head
and export+diff must show real fields (no 0 fields).
