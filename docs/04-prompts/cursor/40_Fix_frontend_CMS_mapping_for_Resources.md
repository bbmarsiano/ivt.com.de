Goal: Fix frontend + CMS mapping for Resources so that:
1) `type` is never null in API/debug and UI (must match Directus values).
2) Download behavior prefers uploaded file (file_id) over external_url.
3) When file_id is present, Download button must point to `/api/media/<file_id>` (same pattern as About/Team).
4) For type=LINK, always open external_url in new tab.
5) For type=PDF/DOC/PPT/etc:
   - if gated=true => show "Request access" button -> /contact?resource=<resource.key>
   - else if file_id present => show "Download" to `/api/media/<file_id>` (same-tab or new-tab is ok, but should trigger download/open)
   - else if external_url present => show "Download" to external_url (open new tab)
   - else show disabled state "No file"

Context:
- Directus returns: resources fields include key,type,file_id,external_url,gated,visible
- Example: ai-research-whitepaper has type="PDF" and file_id="b23db16a-..." and external_url is still set.
- Our debug currently shows directusPublicResourcesSample with type=null for all items, but Directus query proves type exists.
- We already have Next route `/api/media/[id]` that proxies Directus assets with auth; use it for downloads too.

Tasks:
A) Locate CMS adapter that fetches public resources (function name appears in logs: getPublicResourcesAsync). Ensure the Directus request includes `type` and `file_id` and `external_url` and `gated`.
   - It should also include categories keys (for filtering public) via `categories.category_id.key`.
   - Use `--globoff` equivalent in code is irrelevant; just ensure correct field strings.
B) Fix mapping layer so returned DTO includes:
   {
     key,
     title_en,
     type,
     file_id,
     external_url,
     gated,
     downloadUrl,
     categories: string[]
   }
   where downloadUrl is computed:
     if file_id => `/api/media/${file_id}`
     else if external_url => external_url
     else null
C) Ensure project resources fetching (getProjectResourcesAsync/getResourcesByProjectId) returns the same DTO shape with correct downloadUrl and type.
D) Update resources UI component(s) on project page (/projects/[slug]) and any public resources listing to use this logic:
   - gated => request access CTA
   - non-gated => downloadUrl (prefers file upload)
   - LINK => open in new tab (external_url only)
   - Show file icon based on type; if type missing fallback "FILE" but should not happen after fix.
E) Update /api/debug/cms output to include `type` for both public resources and project resources samples.
F) Add a small unit-ish guard: if `type` comes back null/undefined from Directus mapping, log `[IVT][CMS] resources missing type for key=...` and default to "FILE" (but still fix root cause).

Verification commands:
1) `curl -s http://localhost:3000/api/debug/cms | jq '.directusPublicResourcesSample[] | {key,type,file_id,downloadUrl,gated}'`
   - type must be "PDF"/"PPT"/"LINK"/"DOC" etc (not null)
   - ai-research-whitepaper downloadUrl must be `/api/media/b23db16a-...`
2) Open http://localhost:3000/projects/digital-health
   - For ai-research-whitepaper (non-gated + file_id): Download must hit /api/media/<id>
   - For digital-health-presentation (gated=true): show Request access and NOT direct download
   - For innovation-network-link (LINK): open external_url in new tab
3) Optional: add one resource with file_id in Directus UI and check it works.

Implement cleanly, minimal changes, keep existing UI look.
