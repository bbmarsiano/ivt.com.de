Directus CLI schema apply failed with:
TypeError: Cannot read properties of undefined (reading 'fields')
when creating projects.id.
This indicates our generated YAML is not in the exact Directus snapshot format expected by Directus v11.14.1.

Goal:
- Generate a valid snapshot by starting from a real Directus-generated canonical snapshot and merging in our code schema.
- Then schema apply must succeed.

Tasks:
1) Use canonical snapshot as template:
- Add a step in scripts/directus-schema-apply-container.sh:
  - create canonical snapshot inside container:
    npx directus schema snapshot /directus/snapshots/canonical.yaml
  - docker cp it to host (directus/snapshots/canonical.yaml)

2) Replace scripts/generate-directus-snapshot-from-code.js with a canonical-merge generator:
- Input A: directus/snapshots/canonical.yaml (Directus-native format)
- Input B: directus/snapshots/ivt-schema.from-code.json
- Output: directus/snapshots/ivt-directus.snapshot.yaml (still Directus-native)
- Merge rules:
  - Only modify/add these collections: projects, events, news, testimonials
  - Ensure collections entries exist in the correct place/structure used by canonical snapshot
  - Ensure fields entries are placed exactly where Directus expects them (matching canonical structure)
  - Remove any stale entries for these collections before adding new ones (idempotent)
  - Keep all other canonical snapshot parts untouched (system settings, roles, etc.)

3) Determine correct snapshot structure by inspecting canonical.yaml:
- Identify keys for collections, fields, relations in Directus snapshots.
- Use the same structure for the 4 CMS collections.

4) Update scripts/directus-schema-apply-container.sh:
- Generate canonical.yaml first
- Generate merged ivt-directus.snapshot.yaml second
- Copy merged snapshot to container
- Apply with:
  npx directus schema apply /directus/snapshots/ivt-directus.snapshot.yaml --yes
- After apply, create after-apply snapshot for debugging.

5) Add docs:
directus/README.md:
- Explain canonical-merge approach and why.

Acceptance:
- Running bash scripts/directus-schema-apply-container.sh succeeds with no TypeError.
- After apply, psql \dt shows physical tables: projects/events/news/testimonials.
- Directus UI shows fields.
