You are working in a Next.js 13.5 app with Directus-first CMS integration (mocks fallback) already implemented for Projects/News/Events/Testimonials/Partners.

Goal:
Implement Team CMS end-to-end and merge Team into the existing /about page (no separate /team route needed). The /about page must render live Team members from Directus (server fetch) and keep animations in client components. Follow the exact architecture used for Partners.

Requirements:
1) DB (Postgres) migration for team table:
- Create db/migrations/2026-01-XX_cms_team.sql (choose today’s date) with idempotent SQL.
- Table: public.team
- Columns:
  - id UUID PRIMARY KEY DEFAULT gen_random_uuid()
  - slug VARCHAR(255) NOT NULL UNIQUE
  - first_name VARCHAR(255) NOT NULL
  - last_name VARCHAR(255) NOT NULL
  - role_de VARCHAR(255) NOT NULL
  - role_en VARCHAR(255) NOT NULL
  - bio_de TEXT NOT NULL
  - bio_en TEXT NOT NULL
  - email VARCHAR(255) NULL
  - linkedin VARCHAR(500) NULL
  - avatar_file UUID NULL REFERENCES directus_files(id) ON DELETE SET NULL
  - sort INTEGER NOT NULL DEFAULT 0
  - featured BOOLEAN NOT NULL DEFAULT false
  - createdAt TIMESTAMPTZ NOT NULL DEFAULT now()
- Indexes:
  - idx_team_created_at (createdAt)
  - idx_team_sort (sort)
  - idx_team_featured (featured)
  - idx_team_slug_unique (slug unique already)
- Must not fail if table exists; use CREATE TABLE IF NOT EXISTS and CREATE INDEX IF NOT EXISTS patterns where possible.

2) Directus integration:
- Add Team type in lib/types/content.ts:
  interface TeamMember {
    id: string;
    slug: string;
    first_name: string;
    last_name: string;
    role_de: string;
    role_en: string;
    bio_de: string;
    bio_en: string;
    email?: string;
    linkedin?: string;
    avatar_file?: string | null; // Directus file UUID
    sort: number;
    featured: boolean;
    createdAt: string;
  }
- services/directusContentService.ts:
  - Add mapDirectusTeamMember() with robust avatar_file URL mapping:
    If avatar_file is UUID => `${baseUrl}/assets/${uuid}`
    If it is already a URL => pass-through
    If null => null
  - Add getTeam() method:
    GET /items/team?sort=sort,last_name,first_name&limit=-1&fields=*
    fetch with cache: 'no-store'
- services/contentService.ts:
  - Add mockTeam import from lib/data/mock-data (create mock data if not existing)
  - Add getAllTeam() sync (mocks)
  - Add getAllTeamAsync() async (Directus, fallback to mocks)
  - Add getFeaturedTeamAsync() optional helper (featured=true) if needed for homepage later (not required now)
  - Ensure logging uses the existing [IVT][CMS] format with fn=getAllTeamAsync
- scripts/directus-seed-from-mocks.ts:
  - Add seedTeam() similar to seedPartners:
    Upsert by slug (preferred) or by first+last name
    Map fields to Directus
- scripts/directus-fix-permissions.js:
  - Add 'team' to CMS_COLLECTIONS array.

3) UI: Merge About + Team
- Keep route /about (app/about/page.tsx) as the single page.
- Refactor /about to Server Component:
  - export const dynamic = 'force-dynamic'
  - export const revalidate = 0
  - Fetch team on the server: await contentService.getAllTeamAsync()
  - Pass team data into a client component
- Create components/about/AboutClient.tsx (Client Component with 'use client'):
  - Receives team: TeamMember[]
  - Contains any framer-motion usage (animations must not be in server component).
  - Renders existing About content (retain current About copy and layout as much as possible).
  - Add a “Team” section in the page:
    - id="team" anchor
    - Grid of cards with avatar image (Directus asset if available), name, role (based on current language), short bio, and optional links (email, linkedin).
    - Sorting: by sort asc, then last_name.
  - Use existing useLanguage() hook for DE/EN switching, consistent with other pages.
- Update navigation (wherever main nav is defined) so that:
  - “About” stays /about
  - If there was a “Team” link (or if you add one), point it to /about#team (no new route).
- Do NOT introduce createMotionComponent errors: all framer-motion imports must be in client components only.

4) Directus schema visibility note:
- Do not try to create the Directus collection through REST if it causes issues.
- Our standard workflow for new tables is:
  a) Apply SQL migration
  b) Restart Directus container to introspect
  c) If Directus UI doesn’t show the collection automatically, create the collection via UI with “Generated UUID” and map to existing table if needed.
But implement everything in code assuming the collection exists.

5) Docs:
- Update docs/03-cms-directus/ with a new section in the connect doc or create a short note documenting Team:
  - Migration command
  - Restart directus
  - Seed command
  - Where to verify in UI and site (/about#team)

6) Quality gates:
- Ensure npm run typecheck and npm run lint pass.
- Ensure About page renders without runtime errors.
- Ensure [IVT][CMS] logs show DIRECTUS for team fetch when Directus is enabled.

Deliverables:
- The migration file, Team model/type, Directus service methods, contentService methods, seed updates, permissions update, /about server + AboutClient client, nav update, and docs update.
- Keep changes minimal and aligned with the existing Partners implementation patterns.
