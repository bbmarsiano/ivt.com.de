You are working in a Next.js 13 (app router) project that uses Directus as CMS with a “Directus-first, mocks fallback” architecture. We already have Directus connected for About + Team and server-side fetching is working.

Goal:
1) Fix About page rendering the About content twice (duplicate title/content blocks).
2) Make About hero image editable from Directus via a file field (uuid → directus_files) called `hero_image_file`.
3) Make Team avatar editable from Directus by ensuring `team.avatar_file` is a proper Directus file-image field (uuid FK to directus_files). If the field exists but is not file-image, reset it cleanly.
4) Keep a safe fallback: if no Directus image is set, use the existing mock image currently used on the About page (the same image as today).
5) Add clear server logs using the existing [IVT][CMS] prefix where relevant.
6) Provide exact terminal commands to run after changes (migration apply, restart directus, verify via curl, run dev).

Constraints:
- DO NOT expose Directus token to the client. All Directus calls remain server-side.
- Keep Framer Motion only in client components (no motion.* usage in server components).
- Keep caching disabled for CMS fetches in dev (no-store / force-dynamic already in place).

Tasks (implement step-by-step):

A) Add DB migration for About hero image
- Create a new migration file: `db/migrations/2026-01-30_cms_about_hero_image.sql`
- It must:
  - Add column `hero_image_file uuid NULL` to `public.about` table if not exists
  - Add FK constraint to `public.directus_files(id)` with `ON DELETE SET NULL` (idempotent; only create constraint if missing)

B) Ensure Directus metadata field exists for About hero image
- Add a script (or reuse existing approach) that creates the Directus field metadata:
  - Collection: `about`
  - Field: `hero_image_file`
  - Type: uuid
  - Meta: special ["file"], interface "file-image", visible in UI
  - Schema FK: directus_files(id), on_delete SET NULL
- If the field already exists, do not fail; update meta to ensure it is `file-image`.

C) Fix Team avatar_file field type in Directus (metadata + DB)
- Detect current status of `team.avatar_file`:
  - If it exists but is not a proper uuid file-image relation to directus_files, then:
    1) Delete the Directus field metadata for `avatar_file` (if present)
    2) Ensure Postgres column `avatar_file` is `uuid NULL` (drop/recreate if wrong type, but avoid data loss if already uuid)
    3) Ensure FK constraint to directus_files(id) ON DELETE SET NULL (idempotent)
    4) Recreate Directus field metadata as `file-image` (special ["file"], interface "file-image")
- If it’s already correct, do nothing.

D) Map file UUIDs to asset URLs
- In `services/directusContentService.ts`:
  - Ensure About mapper handles `hero_image_file`:
    - If value is a UUID, convert to `${baseUrl}/assets/${id}`
    - If already URL, pass through
  - Ensure Team mapper handles `avatar_file` similarly.

E) Fix About page duplicate render
- Find the About page implementation and components (likely `app/about/page.tsx` and a client component).
- Remove the duplicated block so About content appears only once.
- Structure:
  - Hero section: title + intro + image (image uses Directus hero_image_file URL if present, else fallback to the existing mock image currently used)
  - Body section: mission/vision/other about fields (no repeating title/intro)
- Keep motion animations only in client components.

F) Verification helpers
- If there is an existing debug endpoint `/api/debug/cms`, extend it to include:
  - About: title fields + hero_image_file raw value + derived URL
  - Team: 1 sample member showing avatar_file raw value + derived URL
- Do not include token. Only safe info.

G) Update docs
- Update the Directus docs file for frontend connection (docs/03-cms-directus/03-connect-frontend.md) with:
  - About hero image field name
  - Team avatar field name
  - Commands to verify via curl
  - Expected behavior (fallback image when no upload)

Deliverables:
- Code changes implementing A–G.
- At the end, print a “Post-change Commands” section with exact commands:
  1) Apply migration
  2) Restart directus
  3) Run any script(s) you added for creating/updating fields
  4) Verify via curl (fields/about, fields/team, items/about, items/team sample)
  5) Start dev server and what to check in UI

Also:
- If you add any new scripts, make them executable and reference them in README/docs.
- Ensure TypeScript builds (no type errors) and lint passes.
