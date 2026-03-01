You are working in a Next.js 13 App Router project.

Goal:
Fix /api/debug/cms so any returned Directus file URLs (team avatar + about hero image) use the existing proxy route /api/media/:id instead of directus /assets/:id.

Requirements:
1) In app/api/debug/cms/route.ts:
   - Add a small helper: toMediaProxyUrl(fileId: string | null | undefined): string | null
     -> returns `/api/media/${fileId}` when fileId looks like a UUID, otherwise null.
   - Update the Team sample mapping so `avatarUrl` becomes `/api/media/${avatar_file}` (not DIRECTUS_URL/assets/...).
   - Update the About sample mapping so `hero_image_url` becomes `/api/media/${hero_image_file}` (not DIRECTUS_URL/assets/...).
2) Keep the existing behavior of returning the raw file id fields (avatar_file, hero_image_file) unchanged.
3) Do not expose DIRECTUS_TOKEN. No caching changes needed (keep existing no-store/dynamic settings).

After changes, these should work:
- curl -s http://localhost:3000/api/debug/cms | jq '.directusTeamSample[0].avatarUrl'
  -> should be "/api/media/<uuid>"
- curl -s http://localhost:3000/api/debug/cms | jq '.directusAboutSample.hero_image_url'
  -> should be "/api/media/<uuid>"

Also update docs/03-cms-directus/03-connect-frontend.md with a short note that debug uses /api/media proxy for files.
