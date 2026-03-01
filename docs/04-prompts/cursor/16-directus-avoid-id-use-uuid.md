Directus schema apply still fails at creating field "projects.id" with:
TypeError: Cannot read properties of undefined (reading 'fields') in FieldsService.createField.
This suggests our snapshot is not compatible with defining the primary key "id" field.

Goal:
- Make Directus schema apply succeed reliably for v11.14.1.
- Stop attempting to define/override the built-in primary key field "id" in snapshot.
- Instead, add a separate UUID field (e.g., "uuid") to each CMS collection and treat it as the public identifier in the app.
- Keep slug unique as our main identifier for routing.

Tasks:
1) Update the code schema snapshot mapping logic used by the snapshot generator:
- For collections projects/events/news/testimonials:
  - REMOVE field "id" from the generated Directus snapshot entirely.
  - Add field "uuid" (type uuid) with:
    - required: true
    - unique: true
    - default value generated in DB if possible (use PostgreSQL default gen_random_uuid() if supported)
  - Update merged snapshot generator accordingly.

2) Update scripts/generate-directus-snapshot-from-code.js (canonical merge generator):
- When translating fields:
  - skip "id"
  - inject "uuid" as described
- Ensure slug is unique and required (where present).

3) Update directus/README.md:
- Explain: Directus uses internal integer PK id; we use uuid as public id.
- In Next.js content mapping, map:
  - id := uuid
  - keep slug for routes

4) Update the existing code schema snapshot file (ivt-schema.from-code.json) if necessary:
- Either leave as-is and handle in generator, OR add a note.
Prefer handling in generator to keep code schema unchanged.

Acceptance:
- Running bash scripts/directus-schema-apply-container.sh succeeds with no errors.
- psql shows tables for all 4 CMS collections exist.
- Directus UI shows uuid field and other fields.
