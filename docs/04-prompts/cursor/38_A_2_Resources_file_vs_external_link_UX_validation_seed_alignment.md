Context: Next.js app uses Directus. Collections: resources with fields: file_id (uuid FK directus_files), external_url (string), type (enum like PDF/LINK/etc), visible, gated, relations categories (m2m to resource_categories via resources_categories), plus projects relation already working.

Goal: In Directus UI, editors should easily pick either:

upload/select a file (file_id) OR

provide an external URL (external_url)
and the UI should guide them + enforce rules. Frontend should generate correct downloadUrl:

if file_id → /api/media/<file_id>

else if external_url → use it
Also align seed script so resources can include file_id and/or external_url properly.

Implement tasks:

Directus field UI improvements

Update resources.file_id meta:

keep special: ["file"], interface "file" (already fixed) but set interface to file and add options appropriate for uploads (allow upload/browse).

Add a helpful note: “Upload file OR set external URL. Prefer file for PDFs.”

Update resources.external_url meta:

interface should be a URL input (e.g. input with validation or input interface with type: url)

Add note: “Used when no file upload is attached.”

Validation rule (server-side)
Enforce: exactly one of (file_id, external_url) must be present for visible resources.

If visible = false, allow both null (draft).

If type = 'LINK', require external_url and require file_id to be null.

If type != 'LINK', allow either mode, but for PDFs prefer file (note only, not hard requirement).

Implement as:

either Directus “validation” JSON on fields (if feasible),

or create a small API-side validator in our CMS fetch layer that logs an error + filters out invalid records (safer).
Prefer a robust approach that works even if Directus UI validation is limited.

Frontend mapping

Update resources mapping code so each resource returns:

downloadUrl computed as:

if file_id → /api/media/${file_id}

else if external_url → external_url

else null

Ensure project resources and public resources both use same mapping.

Add defensive logging if visible resource has neither.

Seed script fix

Update scripts/directus-seed-from-mocks.ts:

When seeding resources, support optional file_id.

If mock data contains filePath (local file), upload it via POST /files and store returned id in file_id.

Ensure external_url is set to null when file_id is set.

Keep it idempotent: updates existing resources by key.

Add clear console summary counts for uploaded files.

Verification commands
Provide terminal commands to verify:

Directus schema meta for file_id and external_url

Patch one resource to have file_id and external_url=null

Confirm GET /api/debug/cms shows correct downloadUrl

Confirm /api/media/<id> works

Deliverables:

Code changes in repo

Any new helper script(s)

Commands to run: typecheck, lint, seed, curl verifications