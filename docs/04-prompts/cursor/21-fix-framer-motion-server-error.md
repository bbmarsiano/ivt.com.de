CURSOR PROMPT (Fix Framer Motion “createMotionComponent on server” after server-fetch refactor)

Problem:
We converted app/page.tsx and app/projects/page.tsx to Server Components (for Directus server-side fetching). These files still contain <motion.div> (Framer Motion), which is client-only. Next.js throws:
“Attempted to call createMotionComponent() from the server…”

Goal:
Keep server-side fetching (Directus token safe) BUT move ALL framer-motion usage into Client Components.

Tasks:

1) Home page (app/page.tsx)
- Remove ALL framer-motion usage from app/page.tsx.
- app/page.tsx stays a Server Component that:
  - exports dynamic = 'force-dynamic' and revalidate = 0
  - fetches:
    featuredProjects, testimonials, latestNews, upcomingEvents
- Create a new client wrapper component:
  components/home/HomeClient.tsx
  - Add "use client"
  - This component receives the fetched props:
    { featuredProjects, testimonials, latestNews, upcomingEvents }
  - Move the existing Home page JSX that uses <motion.*> INTO HomeClient.
  - Keep UI/UX identical.

- In app/page.tsx render only:
  <HomeClient featuredProjects={...} testimonials={...} latestNews={...} upcomingEvents={...} />

2) Projects listing page (app/projects/page.tsx)
- Remove ALL framer-motion usage from app/projects/page.tsx.
- app/projects/page.tsx remains a Server Component that:
  - exports dynamic = 'force-dynamic' and revalidate = 0
  - fetches projects via contentService.getProjectsAsync()
- Create a new client wrapper:
  components/projects/ProjectsPageClient.tsx
  - Add "use client"
  - Move the page-level layout/hero section that uses <motion.*> into ProjectsPageClient.
  - Render the existing ProjectsClient inside it.
  - ProjectsPageClient receives initialProjects as prop and passes them to ProjectsClient.

- In app/projects/page.tsx render only:
  <ProjectsPageClient initialProjects={projects} />

3) Project detail page (app/projects/[slug]/page.tsx)
- Confirm app/projects/[slug]/page.tsx does not directly render any <motion.*>.
- If it does, move that motion markup into the existing client component (ProjectDetailClient) and keep the page server-only.

4) Ensure no “use client” is added to app/page.tsx or app/projects/page.tsx.
We want these pages to remain server-side for Directus fetch.

5) Verification / Commands
- npm run typecheck
- npm run lint
- npm run dev
Then load:
- http://localhost:3000
- http://localhost:3000/projects
Confirm:
- No runtime errors
- CMS badge still shows DIRECTUS
- Directus edits appear after refresh
- Terminal logs still show [IVT][CMS] source=DIRECTUS ... for getFeaturedProjectsAsync/getProjectsAsync

Deliver:
- Minimal diff, preserve design/animations.
- Keep Directus token server-only.
- Ensure motion is only used in client components.
Output a short summary of changed files and where motion now lives.
