You are working in a Next.js 13.5 App Router project with Directus vs Mocks switching already proven.
Projects + News are migrated to server-side fetch (force-dynamic) and client wrappers for Framer Motion.
Logging is active:
[IVT][CMS] source=DIRECTUS url=... tokenLen=... fn=...

GOAL:
Migrate the Events feature to the same architecture:
- Server-side fetch from contentService (Directus when USE_DIRECTUS=1, otherwise mocks)
- Pages reflect live Directus edits immediately in DEV (no caching)
- No Framer Motion server boundary errors (motion only in client components)
- Implement:
  1) Events listing page: /events
  2) (Optional but recommended) Event detail page: /events/[slug] IF the codebase already has it or expects it
  3) Homepage Events teaser must render from server-provided props (already accepts props, verify)

REQUIREMENTS:
1) services/contentService.ts
   - Ensure async methods exist:
     - getUpcomingEventsAsync(limit: number)
     - getAllEventsAsync() (or getEventsAsync with a minimal signature)
     - getEventBySlugAsync(slug: string) only if we support /events/[slug]
   - Directus fetch (server-only):
     - Use DIRECTUS_URL + DIRECTUS_TOKEN
     - Use fetch(..., { cache: 'no-store' })
     - Map Directus fields to existing Event type used in UI:
       - slug
       - title_de/title_en
       - description_de/description_en (or equivalent body fields used by UI)
       - location
       - start_at, end_at (ensure correct ISO parsing)
       - registration_url (or equivalent, match UI)
       - cover (if Directus file id -> map to `${DIRECTUS_URL}/assets/${id}`, if string URL -> pass through)
   - Sorting:
     - Listing: sort by start_at ascending (nearest first) OR keep existing UX if different
     - Upcoming: filter start_at >= now, sort ascending, limit N
   - On Directus errors:
     - log: [IVT][CMS] DIRECTUS_FETCH_FAILED fn=... error=...
     - fall back to mocks

2) app/events/page.tsx (Server Component)
   - export const dynamic = 'force-dynamic'
   - export const revalidate = 0
   - Fetch on server: const events = await contentService.getAllEventsAsync() (or chosen method)
   - Render a NEW client wrapper component for any motion/interactions:
     - components/events/EventsPageClient.tsx ('use client')
   - Keep existing UI/UX and filtering behavior (if any)

3) app/events/[slug]/page.tsx (ONLY if route exists or we want it now)
   - Server Component with:
     - export const dynamic = 'force-dynamic'
     - export const revalidate = 0
     - const event = await contentService.getEventBySlugAsync(slug)
     - notFound() if missing
   - Render a NEW client component for UI/motion:
     - components/events/EventDetailClient.tsx ('use client')
   - Preserve existing layout/design

4) components/home/EventsTeaser.tsx
   - Confirm it only uses props and does not call contentService.
   - If it still calls contentService, refactor to accept `events` prop only.

5) Logging proof
   - Ensure /events prints:
     [IVT][CMS] source=DIRECTUS ... fn=getAllEventsAsync
   - Ensure homepage already prints:
     ... fn=getUpcomingEventsAsync
   - If /events/[slug] exists, log:
     ... fn=getEventBySlugAsync

6) Verification commands (include in final summary output):
   - npm run typecheck
   - npm run lint
   - npm run dev
   - curl http://localhost:8055/items/events?limit=5\&fields=slug,title_en,start_at | jq
   - (optional) curl http://localhost:3000/api/debug/cms | jq '.env'

Acceptance Criteria:
- Editing an Event title in Directus updates on:
  - Homepage events teaser
  - /events listing
  - /events/[slug] detail (if implemented)
  after browser refresh in DEV
- No Framer Motion server errors
- Stopping Directus falls back to mocks with clear logs
- Typecheck + lint pass
