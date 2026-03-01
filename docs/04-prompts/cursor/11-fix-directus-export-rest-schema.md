Fix scripts/directus-export-current-schema.js to export schema using Directus REST system endpoints, not by querying collection items (GraphQL/root).

Problem:
Even with admin token, exporting events/news/projects/testimonials fails with 403 and message "Queried in root", indicating GraphQL/root querying or item querying is being used.
We need a schema-level export that does not require querying collection contents.

Requirements:
- Use DIRECTUS_TOKEN if present; otherwise login via email/password.
- Export schema metadata via REST endpoints:
  - GET {DIRECTUS_URL}/collections
  - GET {DIRECTUS_URL}/fields/{collection}
  - GET {DIRECTUS_URL}/relations
- Build current.directus.json from these responses:
  - collections list with meta + schema
  - fields per collection
  - relations
- Do NOT query /items/* and do NOT use GraphQL.
- Keep output format compatible with scripts/directus-diff-schema.js (update diff script if needed).
- Ensure it includes our CMS collections AND Prisma tables (ProjectApplication, _prisma_migrations) as visible in /collections.

Also:
- Update scripts/directus-diff-schema.js to compare against the new export format if required.
- Add a note in directus/README.md: export uses REST schema endpoints.

Acceptance:
- Running `node scripts/directus-export-current-schema.js` must export ALL 6 collections without 403.
- Then `node scripts/directus-diff-schema.js` shows real diffs (not missing due to 403).
