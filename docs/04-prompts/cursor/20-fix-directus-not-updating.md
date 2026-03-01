CURSOR PROMPT #NEXT (Fix: Site shows DIRECTUS badge but content still looks like MOCKS)

Context:
- /api/debug/cms confirms Directus is reachable and returns updated titles (e.g. “Digital Health Solutionss”).
- The UI still shows old titles after refresh/incognito, even though the badge shows “CMS: DIRECTUS”.
- This strongly indicates the pages are either:
  (A) still rendering from preloaded mock data in client components, OR
  (B) being statically rendered/cached at build-time, OR
  (C) fetching on the client without server token (silently falling back to mocks), while the badge is server-only.

Goal:
Make the Projects (and home teasers) render from LIVE Directus data in development immediately after a Directus UI edit, with “hard proof” logs and a clear data flow:
Server fetch (with token) -> pass data to client UI components.
No client-side direct Directus token access.

Tasks:

1) Add “CMS debug logging that always shows”
- In services/contentService.ts, remove/disable any “log once per session” guard.
- Every time any get* method resolves its data source, log:
  [IVT][CMS] source=DIRECTUS url=<...> tokenLen=<...> fn=<methodName>
  or
  [IVT][CMS] source=MOCKS reason=<...> fn=<methodName>
- Also log when Directus fetch fails and fallback happens:
  [IVT][CMS] DIRECTUS_FETCH_FAILED fn=<methodName> error=<message>

2) Force dynamic rendering + no caching on key pages
For these files (create if missing):
- app/page.tsx
- app/projects/page.tsx
- app/projects/[slug]/page.tsx
- any home teaser components that fetch projects/news/events/testimonials

Ensure they are NOT statically cached:
- Add at top-level of each page:
  export const dynamic = 'force-dynamic';
  export const revalidate = 0;

Also ensure any Directus fetch calls use:
  fetch(url, { cache: 'no-store', headers: { Authorization: `Bearer ${token}` } })

3) Ensure data is fetched on the SERVER, then passed into CLIENT UI
Audit the Projects listing implementation:
- If the Projects listing page (or components it uses) is a client component that calls contentService in the browser, refactor to:
  - app/projects/page.tsx becomes a SERVER component that calls:
      const projects = await contentService.getProjects({ ...defaultFilters });
    then renders:
      <ProjectsClient initialProjects={projects} />
  - Create/adjust components/projects/ProjectsClient.tsx as a client component that:
      - receives initialProjects
      - runs filters/sort/search locally on that array (no refetch needed for now)
  - The Project detail page should also fetch on server:
      const project = await contentService.getProjectBySlug(slug)
    and pass it to a client UI component only if needed.

Do the same pattern for homepage teasers:
- Server page loads featured projects/news/events/testimonials via contentService
- Pass them into client carousel/slider components as props.

Important:
- Do NOT import lib/env.directus.ts into any client component.
- If a component must remain client-only, it must receive data via props from a server component.

4) Add a “hard proof” UI marker in DEV
- Update components/CmsSourceBadge.tsx (or create another DEV-only component) to also show a tiny “LIVE title check” line for one known slug:
  e.g. fetch “digital-health” title_en on server (no-store) and display:
  “digital-health: <title_en>”
- This must only render in NODE_ENV=development.
- This provides visual proof on the page itself.

5) Provide a quick verification checklist in docs
Update docs/03-cms-directus/03-connect-frontend.md with:
- How to see server logs
- Which pages are forced dynamic
- A 3-step proof:
  (1) Change title in Directus UI
  (2) Refresh /projects
  (3) See updated title + DEV badge line

6) Commands for build & run (add to docs and print in summary)
- npm run typecheck
- npm run lint
- npm run dev
- curl -s http://localhost:3000/api/debug/cms | jq

Acceptance Criteria:
- After editing a project title in Directus UI, refreshing /projects shows the updated title immediately.
- Terminal shows [IVT][CMS] logs for the relevant methods on each request.
- No client bundle contains Directus token usage.
- DEV badge remains green and shows the “digital-health” live title line matching Directus.

Deliver:
- Make the refactor minimal but correct.
- Keep existing UI/UX unchanged (filters, layout, cards).
- Ensure TypeScript passes.

After changes, include in your response:
- which files changed
- where the server fetch now happens for Projects + Home
- how to verify in 60 seconds
