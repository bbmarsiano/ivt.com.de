We have a hard proof bug: Directus PATCH to /items/about/{id} succeeds and updates title_en, but the website does not reflect changes. Also /api/debug/cms returns directusAboutSample = null.

Goal: Fix About fetching so it always reads live data from Directus (when USE_DIRECTUS=1), and debug endpoint shows a non-null directusAboutSample.

Context:
- Directus v11.14.1
- about table exists with columns: id, title_de/en, intro_de/en, mission_de/en, vision_de/en, createdAt, updatedAt, hero_image_file (uuid -> directus_files)
- app/about/page.tsx already has:
  export const dynamic = 'force-dynamic'
  export const revalidate = 0

Likely cause: Directus /items/about can return either {data: [...]} or {data: {...}} depending on singleton meta. Our code probably assumes the wrong shape, so it returns null or falls back to mocks.

Requirements:
1) Update services/directusContentService.ts (or the directus content layer used by contentService) to implement getAbout() robustly:
   - Fetch /items/about with fields: id,title_de,title_en,intro_de,intro_en,mission_de,mission_en,vision_de,vision_en,hero_image_file,updatedAt
   - Use cache: 'no-store'
   - Accept both shapes:
       const raw = json.data;
       const item = Array.isArray(raw) ? raw[0] : raw;
     If item is missing, return null (not throw).
   - Map hero_image_file:
       if uuid -> `${baseUrl}/assets/${uuid}`
       expose hero_image_url in the mapped About type (or similar field used by UI)
2) Ensure services/contentService.ts has getAboutAsync() that uses Directus first and falls back to mocks only on real errors, with logging:
   - [IVT][CMS] source=DIRECTUS url=... tokenLen=... fn=getAboutAsync
   - [IVT][CMS] DIRECTUS_FETCH_FAILED fn=getAboutAsync error=...
3) Update app/api/debug/cms/route.ts:
   - Add directusAboutSample using contentService.getAboutAsync() (NOT a separate fetch implementation)
   - Ensure endpoint is force-dynamic (already) and no caching
   - Add errors.about when about is null due to fetch failure (include message but no secrets)
4) Verify About page actually uses getAboutAsync() (server-side) and passes it into the About client component.
   - If About page currently still uses static mock text, refactor it like Projects/News/Events:
     server component fetches about+team, passes props to AboutClient (client component handles motion)
   - Keep tokens server-only
5) Add a small DEV-only hard proof in CmsSourceBadge (or About page footer) to display:
   "ABOUT: <title_en>" from live about data, so we visually confirm updates after refresh.

After changes:
- `curl -s http://localhost:3000/api/debug/cms | jq '.directusAboutSample.title_en'` must show the updated "About (API PROOF) ..." value.
- Refreshing /about must show the updated title.
- Logs must include [IVT][CMS] ... fn=getAboutAsync
- No secrets leaked (token never shown, only length).
