You are working in a Next.js 13.5 App Router project that already supports Directus vs Mocks switching and logs:
[IVT][CMS] source=DIRECTUS ... fn=...
Directus debug endpoint /api/debug/cms is working and shows live data.
Projects are already migrated to server-fetch (force-dynamic) with client wrappers for Framer Motion.

GOAL:
Migrate the News feature to the same architecture:
- Server-side fetch from contentService (Directus when USE_DIRECTUS=1, otherwise mocks)
- Pages should reflect live Directus edits immediately in DEV (no caching issues)
- Avoid server/client boundary errors with Framer Motion (keep motion only in client components)
- Implement both:
  1) News listing page: /news
  2) News detail page: /news/[slug]
  3) Homepage News teaser should render from server-provided props (already refactored to accept props)

REQUIREMENTS:
1) contentService.ts
   - Ensure there are async methods:
     - getLatestNewsAsync(limit: number)
     - getNewsAsync() OR getNewsAsync({ ...filters? }) (choose a consistent minimal signature)
     - getNewsBySlugAsync(slug: string)
   - When Directus is enabled:
     - Fetch from Directus REST API using DIRECTUS_URL + DIRECTUS_TOKEN (server only)
     - Use "cache: 'no-store'" for Directus fetches
     - Map Directus fields to existing News type used in UI (bilingual fields, slug, published_at, cover, summary, tags, content)
     - Sorting:
       - Listing: newest first by published_at
       - Latest teaser: newest first, limit N
   - On Directus errors, log:
     [IVT][CMS] DIRECTUS_FETCH_FAILED fn=... error=...
     then fall back to mocks.

2) app/news/page.tsx (Server Component)
   - export const dynamic = 'force-dynamic'
   - export const revalidate = 0
   - Fetch on server: const news = await contentService.getNewsAsync()
   - Render a NEW client wrapper component (e.g. components/news/NewsPageClient.tsx) for any motion/interactive UI.
   - If current news page already exists, refactor it accordingly.

3) app/news/[slug]/page.tsx (Server Component)
   - export const dynamic = 'force-dynamic'
   - export const revalidate = 0
   - Fetch on server: const item = await contentService.getNewsBySlugAsync(slug)
   - If not found -> return notFound()
   - Render a NEW client component (e.g. components/news/NewsDetailClient.tsx) to preserve animations and client-only logic.
   - Ensure existing design/UX is preserved.

4) components/home/NewsTeaser.tsx
   - Confirm it only receives "news" via props and does not call contentService.
   - If it still calls contentService anywhere, refactor to accept props only.

5) Types + mapping
   - Keep existing News type used by UI.
   - Ensure the fields map correctly:
     - title_de/title_en
     - summary_de/summary_en
     - slug
     - published_at
     - cover (if Directus uses file relation or URL; use a safe approach: if it’s a Directus file id, map to a usable image URL with DIRECTUS_URL/assets/{id}; if it’s already a string URL, pass through)
     - tags (json array)
     - content_de/content_en if used by detail page (or description/body fields—match what the UI expects)

6) Logging proof
   - Ensure /news and /news/[slug] requests print:
     [IVT][CMS] source=DIRECTUS ... fn=getNewsAsync
     [IVT][CMS] source=DIRECTUS ... fn=getNewsBySlugAsync
   - If mocks are used, log the reason.

7) Verification commands (print these in the final summary):
   - npm run typecheck
   - npm run lint
   - npm run dev
   - curl http://localhost:3000/api/debug/cms | jq '.directusProjectsSample[0]'
   - curl http://localhost:8055/items/news?limit=3\&fields=slug,title_en,published_at

Acceptance Criteria:
- Editing a News title in Directus updates on:
  - Homepage news teaser
  - /news listing
  - /news/[slug] detail page
  after a browser refresh (no hard refresh needed in DEV)
- No Framer Motion server errors
- Falls back to mocks if Directus is stopped, with clear logs
- Typecheck + lint pass
