We still get 403 "Queried in root" when calling /fields/{collection} and when trying to create fields (UUID PK) for CMS collections.
Delete /collections works, but creating fields does not, resulting in meta-only collections and broken /fields/projects.

Goal:
- Make schema apply create REAL fields and DB tables by using the correct Directus system endpoints.
- Avoid /fields/{collection} endpoints entirely.
- Use global fields endpoints:
  - POST /fields with { collection, field, type, schema, meta }
  - GET /fields with filter[collection][_eq]=...
- Ensure after apply, GET /fields?filter[collection][_eq]=projects returns non-zero fields.
- Ensure id is UUID primary key (or the closest Directus-supported equivalent).
- Keep DIRECTUS_TOKEN support.

Tasks:
1) Update scripts/directus-apply-schema.js:
- Replace any usage of /fields/{collection} for create/read with:
  - POST /fields (global)
  - GET /fields?filter[collection][_eq]={collection}
- When creating a collection:
  - POST /collections (as before)
  - Then create fields via POST /fields
- Add verification after each collection:
  - fetch fields via GET /fields?filter[collection][_eq]=name
  - if count == 0 => throw error with guidance

2) Update scripts/directus-export-current-schema.js:
- When exporting fields, do NOT call /fields/{collection}.
- Use GET /fields?filter[collection][_eq]=name and build the export from that.

3) Update scripts/directus-hard-reset-meta.js:
- When deleting field metadata, do NOT call /fields/{collection}.
- Use GET /fields?filter[collection][_eq]=name to list fields, then DELETE /fields/{collection}/{field} OR DELETE /fields/{id} depending on API shape.
- Keep best-effort behavior.

4) Improve logs:
- Print the exact URL used on failure and HTTP status.
- Print "created N fields" per collection.

Acceptance:
After running:
  DIRECTUS_RESET=1 ./scripts/directus-apply-schema.sh
These must work:
  curl -s -H "Authorization: Bearer $DIRECTUS_TOKEN" "http://localhost:8055/fields?filter[collection][_eq]=projects" | head
And export+diff should show real fields (not 0 fields).
