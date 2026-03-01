You are working in a Next.js 13 app with Directus integration already in place.

Goal: Implement real download/link behavior for Resources:
- If a resource has file_id (Directus file UUID), downloadUrl must be `/api/media/{file_id}` (same proxy route used for team avatars and about hero images).
- Else if it has external_url, downloadUrl must be that URL.
- Else downloadUrl is null and the UI should not render an active download link.

Requirements:
1) Update the Resource type (lib/types/content.ts) to include:
   - file_id?: string | null
   - external_url?: string | null
   - downloadUrl?: string | null
2) Update services/directusContentService.ts mapping for resources so it returns downloadUrl according to rules above.
   - Do NOT return direct `${DIRECTUS_URL}/assets/...` for file_id. Always use `/api/media/{id}`.
   - Keep cache: 'no-store' for Directus fetches.
3) Update mock resources mapping (if any) so mocks also populate downloadUrl consistently (external_url -> downloadUrl; file_id -> /api/media/id if present).
4) Update UI where resources are rendered (project detail resources section + public resources teaser if exists):
   - Use `resource.downloadUrl` as the href
   - If downloadUrl is null, show the item but disable/hide the download button/link
   - For external_url, open in new tab (target=_blank, rel=noopener noreferrer)
   - For `/api/media/...`, normal download/open is fine.
5) Update /api/debug/cms to include a sample list:
   - directusPublicResourcesSample (first 3 resources) with fields: key, title_en, file_id, external_url, downloadUrl
   This is hard proof that the computed URL is correct.
6) Add logs (server-side only) when fetching resources:
   - [IVT][CMS] source=DIRECTUS ... fn=getPublicResourcesAsync
   - No secrets.

After changes, ensure typecheck and lint pass.

Provide a short summary of changed files.
