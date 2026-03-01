Goal: Enable proper file uploads for Resources in Directus UI and make frontend use /api/media/:fileId for downloads.
Current state: resources.file_id has FK to directus_files(id) but its Directus field meta has special=null and interface=null, so UI does NOT show “Browse file…”.
We also need public resources to load correctly (currently debug shows directusPublicResourcesSample=[] even though we have a “public” category).

Requirements

Fix Directus field meta for resources.file_id so it becomes a proper Directus file field:

special: ['file']

interface: 'file' (not file-image, because PDFs/DOCs)

display: 'file'

keep schema FK as-is

Implement this fix in code (like we did before), not manually:

Add a new script: scripts/directus-fix-resource-file-field.ts (TypeScript)

It should:

read .env.directus (DIRECTUS_URL + DIRECTUS_TOKEN)

call PATCH {DIRECTUS_URL}/fields/resources/file_id with payload:

{
  "meta": {
    "special": ["file"],
    "interface": "file",
    "display": "file",
    "options": null,
    "display_options": null,
    "hidden": false,
    "readonly": false,
    "required": false,
    "searchable": true
  }
}


log success: [IVT][CMS] fixed resources.file_id meta (file upload enabled)

fail with a clear error message if 403/404

Add npm script: "directus:fix:resources-file": "tsx scripts/directus-fix-resource-file-field.ts"

Update scripts/directus-fix-permissions.js (or the shell wrapper if you have one) to include this run after permissions (optional but nice).

Frontend download URL behavior

Ensure resource model mapping sets:

if file_id exists → downloadUrl = /api/media/${file_id}

else if external_url exists → downloadUrl = external_url

else downloadUrl = null

Update the resources UI (project detail resources section + public resources listing if exists) to use downloadUrl.

For type === 'LINK' keep “Open link” behavior (target blank).

Fix public resources fetch

In directusContentService / contentService implementation, ensure getPublicResourcesAsync() returns visible public resources using the M2M alias categories:

Fetch resources with fields including:

key,title_en,title_de,description_en,description_de,type,file_id,external_url,gated,visible,published_at

plus categories: categories.category_id.key

Then filter in code:

visible === true

categories contains category_id.key === 'public'

gated can still be true/false (we’ll handle UX later)

Keep cache: 'no-store'.

Update /api/debug/cms to expose:

directusPublicResourcesSample (first up to 5 items, include key, file_id, downloadUrl, and categories keys)

Keep logging format consistent:

All CMS methods log [IVT][CMS] source=DIRECTUS ... fn=...

If fallback mocks are used, keep the existing MOCKS logs.

Acceptance criteria (must pass)

Running npm run directus:fix:resources-file makes curl /fields/resources/file_id show meta.special=["file"] and meta.interface="file".

In Directus UI → Resources → edit item → file_id shows Browse file… and upload works.

After setting file_id, the site shows a working download button that hits /api/media/<file_id>.

curl -s http://localhost:3000/api/debug/cms | jq '.directusPublicResourcesSample' returns non-empty if a public resource exists.

npm run typecheck and npm run lint pass.