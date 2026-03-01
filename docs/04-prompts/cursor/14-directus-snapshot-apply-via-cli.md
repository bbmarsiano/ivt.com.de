We confirmed Directus CLI supports:
- npx directus schema snapshot [path]
- npx directus schema apply <path>

We currently have a code-derived schema file:
directus/snapshots/ivt-schema.from-code.json
but this is NOT in Directus snapshot format.

Goal:
- Generate a valid Directus schema snapshot YAML that represents the code schema 1:1 for CMS collections:
  projects, events, news, testimonials
- Then apply it using Directus CLI inside the running container (ivt_directus).
- Preserve Prisma tables: ProjectApplication and _prisma_migrations (do not include them in our snapshot).

Tasks:
1) Create converter script:
scripts/generate-directus-snapshot-from-code.js
- Input: directus/snapshots/ivt-schema.from-code.json
- Output: directus/snapshots/ivt-directus.snapshot.yaml
- The output must match Directus schema snapshot structure so `directus schema apply` can consume it.
- Only include collections: projects, events, news, testimonials.
- Fields must match the code schema names and types.
- Prefer simple scalar types supported by Directus:
  - uuid (for id, primary key)
  - string/text
  - boolean
  - timestamp/datetime
  - json (for coordinator/metrics/documents/images/tags if code expects arrays/objects)
- Ensure required fields and unique constraints (slug unique) where appropriate.
- Provide sensible field meta (interface) but keep it minimal; correctness > UI polish.

2) Add scripts:
scripts/directus-schema-apply-container.sh
- Runs:
  a) node scripts/generate-directus-snapshot-from-code.js
  b) docker exec -it ivt_directus sh -lc 'npx directus schema apply /directus/snapshots/ivt-directus.snapshot.yaml --yes'
  c) then verify inside container:
     - npx directus schema snapshot /directus/snapshots/after-apply.yaml
- Copies snapshots from container to host using docker cp.

3) Update directus/README.md:
- Step-by-step: backup snapshot, generate snapshot, apply snapshot, verify (UI + psql)
- Include exact commands.

Acceptance:
- After running scripts/directus-schema-apply-container.sh:
  - psql \dt must show public.projects/public.events/public.news/public.testimonials tables exist
  - Directus Admin UI shows fields in those collections
  - No 403 when accessing fields in UI
