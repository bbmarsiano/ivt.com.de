We already have a Directus schema apply script and an initial snapshot created from a spec.
Now we need a NEW snapshot that matches the CURRENT code models 1:1, but we must avoid breaking anything.

Goal:
- Generate a new schema snapshot derived from current code models.
- Provide a diff tool that compares current Directus schema vs the new snapshot.
- Do NOT apply automatically. No schema changes should be made in Directus in this step.

Source of truth:
- services/contentService.ts (public contract)
- lib/mock/*.ts and any shared types used by UI

Tasks:
1) Create doc: directus/MODEL_CONTRACT.md
- For each content type (projects/events/news/partners/testimonials/team/resources), list the exact field names and TS types as used in code today.
- Include how bilingual fields are represented in code (nested object vs *_de/_en).
- Identify which fields are required vs optional in practice (based on mocks and validators).

2) Generate a new snapshot file:
- directus/snapshots/ivt-schema.from-code.json
This snapshot must reflect the code models 1:1 (names + shapes).
If code uses nested bilingual objects, prefer JSON fields.
If code uses *_de/_en already, keep that.
If code uses images/documents arrays of objects, mirror as JSON fields (1:1).
Do not "improve" the model.

3) Add scripts:
- scripts/directus-export-current-schema.js
  - logs in via admin creds and exports current schema from Directus into directus/snapshots/current.directus.json
- scripts/directus-diff-schema.js
  - compares current.directus.json vs ivt-schema.from-code.json
  - prints a human-readable diff: missing collections/fields, mismatched types, mismatched required/unique/enums
  - exit code 0 if identical, 1 if differences exist

4) Update docs:
- directus/README.md:
  - explain the two snapshots:
    - the existing spec-based snapshot
    - the new from-code snapshot
  - explain the safe workflow:
    export current -> diff -> only then apply

Constraints:
- Do not modify Next.js UI or contentService
- Do not apply schema changes in this prompt

Deliverable:
- Running:
  node scripts/directus-export-current-schema.js
  node scripts/directus-diff-schema.js
  shows whether Directus matches code 1:1 before we change anything.
