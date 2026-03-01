You are working inside the ivt.com.de Next.js project.

Goal: Integrate Directus as the content source behind the existing contentService, with a safe feature-flag and automatic fallback to mock data. The UI/UX must not change.

Current state:
- Mock data exists in lib/mock/*.ts and contentService currently reads from mocks.
- Directus is running at http://localhost:8055
- .env.directus contains DIRECTUS_URL and DIRECTUS_TOKEN (admin token) used by scripts.
- Content was seeded into Directus collections: projects, events, news, testimonials.

Requirements:
1) Add environment variables:
   - In .env.local we will set:
     USE_DIRECTUS=0|1
     DIRECTUS_URL=http://localhost:8055
     DIRECTUS_PUBLIC_TOKEN=... (optional)
     DIRECTUS_ADMIN_TOKEN=... (optional)
   But: For server-side fetching we can use DIRECTUS_TOKEN if we keep it in .env.local (dev-only). Do NOT expose admin token to client.
   Decide a secure approach:
   - Use server-side fetching (app router server components/services) so token never ships to browser.
   - For public content (projects/news/events/testimonials), configure Directus public role read access so token is not needed OR use a server-only token.
   Choose the safest minimal change now:
   - Implement server-side Directus client inside services, reading DIRECTUS_URL and DIRECTUS_TOKEN from process.env, but ensure no client component imports it (use server-only module).
   - Add guard: if executed in browser, throw error (to prevent leaking secrets).
   - USE_DIRECTUS default false.

2) Implement Directus adapter:
   - Create: services/directusContentService.ts (server-only)
     Functions:
       getProjects(filters)
       getProjectBySlug(slug)
       getFeaturedProjects()
       getUpcomingEvents(limit)
       getLatestNews(limit)
       getTestimonials(limit)
     Use Directus REST API:
       GET /items/{collection}
       Apply filters:
         - projects by slug equality
         - featured true
         - status/industry
         - search by title/summary/tags (best-effort: OR filters)
       Sorting:
         - projects by createdAt desc
         - events by start_at asc (and filter start_at >= now)
         - news by published_at desc
     Map Directus items into the exact same TypeScript shapes currently used by the UI (do not change components).
     Handle bilingual fields properly (title_de/title_en etc).

   - Ensure JSON fields remain arrays/objects (tags, images, coordinator, documents, eligibility_*).

3) Update services/contentService.ts:
   - Add a runtime switch:
     if USE_DIRECTUS is truthy -> try Directus adapter
     catch any error -> log once (server log) and fallback to existing mock implementation
   - Keep the same exported API so components remain unchanged.

4) Types:
   - Add minimal types for Directus responses to keep type safety.
   - Ensure npm run typecheck passes.

5) Permissions:
   - We should not require an auth token in the browser.
   - For now, use server-side token only (DIRECTUS_TOKEN), but do not require it if Directus public role can read.
   Implement:
     - If DIRECTUS_TOKEN is missing: try unauthenticated fetch (public role) and still work.
     - If Directus returns 401/403, fallback to mocks.

6) Documentation:
   - Create docs/03-cms-directus/03-connect-frontend.md
   Include:
     - How to enable Directus mode: USE_DIRECTUS=1
     - Required env vars
     - How fallback works
     - Quick verification steps

7) Provide commands for build & run:
   - npm run dev
   - npm run typecheck
   - npm run lint
   - Optional: curl checks

Return a short summary of files changed and how to test.

IMPORTANT: No UI changes, no breaking changes, no moving of files unless necessary.
