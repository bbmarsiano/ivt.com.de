Fix Directus schema apply so collections are created with UUID primary keys, matching code models.

Current diff:
projects/events/news/testimonials have id type integer in Directus but code expects uuid.

Goal:
- Ensure new collections are created with UUID primary key.
- Provide a safe reset path for only CMS collections, preserving Prisma tables.
- After reset+apply, schema diff must be 0.

Tasks:
1) Update scripts/directus-apply-schema.js:
   - When creating a collection via Directus API, set the collection's primary key field to UUID.
   - Create field "id" explicitly as uuid (primary_key=true, required=true, interface hidden).
   - Ensure it matches Directus supported field type for uuid.
   - If API requires meta/schema for pk, implement it correctly.
   - IMPORTANT: Do not attempt to alter existing id type; instead rely on reset + recreate.

2) Update scripts/directus-reset-cms-collections.js:
   - Ensure delete handles 204 No Content (no JSON parsing).
   - Continue preserving ProjectApplication and _prisma_migrations.
   - Reset only collections defined in ivt-schema.from-code.json.

3) Update scripts/directus-apply-schema.sh:
   - If DIRECTUS_RESET=1, run reset then apply.
   - Print a reminder to re-run export+diff after apply.

4) Verification target:
   - After running DIRECTUS_RESET=1 ./scripts/directus-apply-schema.sh
   - node scripts/directus-export-current-schema.js
   - node scripts/directus-diff-schema.js
   should show 0 differences.

Deliverable: list modified files and brief note explaining uuid PK behavior.
