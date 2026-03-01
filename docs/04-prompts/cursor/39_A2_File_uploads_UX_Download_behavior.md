We already fetch Directus resources and expose normalized fields in API/debug/cms:
- resource.downloadUrl is either:
  - "/api/media/<file_id>" when file_id is set (Directus file upload)
  - "https://..." when external_url is set
- resource.gated boolean exists (gated UX is handled later)
- resources appear on:
  - /projects/[slug] resources section
  - /projects listing shows "Resources: N"

Task: implement frontend UX for file uploads/download behavior for Resources (A2), without changing gated behavior yet.

Requirements:
1) In ALL places where resources are rendered, use the normalized `downloadUrl`:
   - If downloadUrl starts with "/api/media/" => treat as internal file download/preview.
   - If downloadUrl starts with "http" => treat as external.
2) Render a consistent action button/link:
   - For type === "LINK" (or downloadUrl is http and resource.type === "LINK"): show "Open" and open in new tab (target=_blank rel=noopener).
   - For file downloads (downloadUrl starts with "/api/media/"): show "Download" (anchor href to downloadUrl). Add `download` attribute so the browser downloads; allow PDF to open if user wants (still ok).
   - For external documents (downloadUrl is http and type !== "LINK"): show "Download" and open in new tab (target=_blank). This is fine for now since external_url is a direct link.
3) Show a small indicator in the UI when a resource is file-based vs external (icon or label like "File" / "External").
4) Remove any remaining mock-only download URLs in resources UI. If Directus returns resources, render those; if it returns none, show empty state (not mock docs).
5) Keep Typescript strict and update types if needed (Resource type/interface).
6) Add a tiny helper function (shared) e.g. `getResourceAction(resource)` or `getResourceLinkProps(resource)` to avoid repeating logic across components.

Verification steps (must pass):
- `curl -s http://localhost:3000/api/debug/cms | jq '.directusPublicResourcesSample'` shows at least one resource with downloadUrl "/api/media/<id>" (file_id set).
- Open /projects/digital-health and confirm:
  - The resource with file_id uses /api/media/... and the button downloads/opens correctly.
  - External_url resources still work.
- `npm run typecheck` and `npm run lint` must pass.

Important constraints:
- Do NOT implement gated logic here (no request access behavior changes). Just make download links correct.
- Do not change the API layer; only frontend rendering/UX and shared helpers/types.