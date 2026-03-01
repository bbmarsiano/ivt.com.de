We have a schema diff: Directus currently has collections [projects, ProjectApplication, _prisma_migrations].
The "projects" collection in Directus is NOT matching code schema (wrong enum: published/draft/archived, missing fields).
We want Directus to match code schema 1:1.

Goal:
- Keep Prisma tables untouched: ProjectApplication and _prisma_migrations must remain unchanged.
- Reset ONLY the CMS collections that are managed by Directus (starting with projects).
- Apply the code-derived schema snapshot (directus/snapshots/ivt-schema.from-code.json).
- Ensure the result includes collections: projects, events, news, testimonials (and any other code collections present in the snapshot).
- Ensure projects.status enum becomes [ongoing, completed] and required fields match code.
- Provide a single command workflow.

Tasks:
1) Add script: scripts/directus-reset-cms-collections.js
- Logs in as admin using DIRECTUS_URL, DIRECTUS_ADMIN_EMAIL, DIRECTUS_ADMIN_PASSWORD
- Lists existing collections
- Deletes ONLY collections that are in the code snapshot AND are safe to reset:
  - If collection name matches one of our content collections in the from-code snapshot (projects/events/news/partners/testimonials/team/resources etc.)
  - Never delete ProjectApplication or _prisma_migrations or any collection not in the snapshot.
- Print which collections were deleted.

2) Update scripts/directus-apply-schema.sh to support a "reset then apply" mode:
- If env var DIRECTUS_RESET=1, it runs reset script first, then apply.
- Otherwise apply only.

3) Update directus/README.md with:
- Safe workflow:
  export current -> diff -> reset cms -> apply -> (optional) seed

Deliverable commands:
DIRECTUS_RESET=1 ./scripts/directus-apply-schema.sh

Verification:
- Running export+diff after reset+apply should show 0 differences (or only expected system fields).
- Directus should show the expected collections in UI.
