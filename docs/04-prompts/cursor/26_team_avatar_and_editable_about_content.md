Goal: Make Team avatars work (avatar_file in Directus) and make the About page text editable from Directus (singleton), matching existing architecture (Directus-first + mocks fallback), keeping tokens server-only. Follow the established patterns from Partners/News/Events.

Context:
- We already have Directus collections: projects, news, events, testimonials, partners, team.
- Team schema includes avatar_file (uuid, special=file) and items exist.
- About page exists and has #team section. We want About page text editable (DE/EN), not hardcoded.
- Existing code patterns:
  - services/contentService.ts has async methods that choose Directus or mocks and log with [IVT][CMS].
  - services/directusContentService.ts maps Directus fields and converts file UUIDs to {baseUrl}/assets/{id}.
  - Pages fetch on server (force-dynamic, revalidate=0) and pass props to client components.
  - Seed script scripts/directus-seed-from-mocks.ts upserts data into Directus.

Tasks:

A) Team avatars: map avatar_file to actual image URL
1) Update lib/types/content.ts:
   - Ensure TeamMember type includes:
     avatarFile?: string | null (raw Directus uuid)
     avatarUrl?: string | null (computed URL for rendering)
   - Keep existing fields: slug, first_name, last_name, role_de/en, bio_de/en, email, linkedin, featured, sort.

2) Update services/directusContentService.ts:
   - Add helper to map Directus file id -> absolute URL:
     if value is UUID-like => `${baseUrl}/assets/${id}`
     if already URL => return as-is
     if null/empty => null
   - Update mapDirectusTeamMember() to produce avatarUrl from avatar_file:
     - Read avatar_file (uuid or object depending on fields)
     - Support both shapes:
       a) avatar_file = "uuid"
       b) avatar_file = { id: "uuid" }
   - Ensure all Directus fetches use cache: 'no-store'.

3) Update services/directusContentService.ts team fetch:
   - Add method getTeamMembers() fetching:
     GET /items/team?limit=-1&sort=sort,last_name&fields=slug,first_name,last_name,role_de,role_en,bio_de,bio_en,email,linkedin,featured,sort,avatar_file
   - Map to TeamMember with avatarUrl.

4) Update services/contentService.ts:
   - Add getTeamAsync() (or getAllTeamAsync()) that logs and uses DirectusContentService.getTeamMembers(), fallback to mockTeam (existing mocks).
   - Ensure [IVT][CMS] log includes fn=getTeamAsync (or chosen name), with DIRECTUS/MOCKS.

5) Update About page rendering:
   - If About page currently uses mockTeam directly, refactor to server-fetch:
     - app/about/page.tsx should be a Server Component (no framer-motion usage).
     - export const dynamic='force-dynamic' and export const revalidate=0
     - Fetch:
       aboutContent = await contentService.getAboutContentAsync()
       team = await contentService.getTeamAsync()
     - Pass into a client component that holds motion/animations (if any) and UI.
   - Create/adjust components/about/AboutClient.tsx (client) that receives props { aboutContent, team } and renders:
     - About hero text (from aboutContent)
     - Team section (#team) listing members with avatarUrl rendered via next/image (or img if already used).
     - If avatarUrl is null, show a fallback circle with initials.
   - Preserve existing design; only replace data source.

B) Editable About content via Directus singleton collection "about"
1) Add a DB migration:
   - Create db/migrations/2026-01-30_cms_about.sql (idempotent).
   - Table: public.about
     - id uuid primary key default gen_random_uuid()
     - title_de varchar(255) not null default ''
     - title_en varchar(255) not null default ''
     - intro_de text not null default ''
     - intro_en text not null default ''
     - mission_de text not null default ''
     - mission_en text not null default ''
     - vision_de text not null default ''
     - vision_en text not null default ''
     - createdAt timestamptz not null default now()
     - updatedAt timestamptz not null default now()
   - Add trigger or simply update updatedAt in app/seed; keep it simple.

2) Directus metadata:
   - Ensure Directus sees it after restart.
   - If collection exists with meta null, patch meta to:
     singleton=true, hidden=false, icon="info", note="About page content", display_template="{{title_en}}", sort ~ 40.

3) Add AboutContent type:
   - lib/types/content.ts add interface AboutContent with the above fields.

4) Add DirectusContentService.getAboutContent():
   - GET /items/about?limit=1&fields=*
   - Because singleton: prefer /items/about (Directus returns array). Take first item.
   - Map to AboutContent.

5) Update contentService.ts:
   - Add getAboutContentAsync() that uses Directus, fallback to mockAboutContent.
   - Add logs [IVT][CMS] fn=getAboutContentAsync and fallback logs.

6) Seed support:
   - Add mockAboutContent in lib/data/mock-data (DE/EN strings matching current About page copy).
   - Update scripts/directus-seed-from-mocks.ts:
     - Add seedAbout() that upserts singleton:
       - Fetch existing: GET /items/about?limit=1&fields=id
       - If exists: PATCH /items/about/{id}
       - Else: POST /items/about
     - Include in summary output: about: created/updated.

7) Permissions:
   - Update scripts/directus-fix-permissions.js to include collections: team and about, same pattern as others.

C) Verification additions:
- Update app/api/debug/cms/route.ts to also include:
  - directusTeamSample (first 2 team members with avatar_file + derived avatarUrl)
  - directusAboutSample (title_en)
- Ensure debug endpoint never exposes token value.

Acceptance criteria:
- Upload an avatar in Directus UI for a team member (avatar_file), and it shows on http://localhost:3000/about#team after refresh.
- Editing About text fields (title_en/de, intro_en/de etc.) in Directus UI updates the About page after refresh.
- Terminal logs show [IVT][CMS] source=DIRECTUS ... fn=getTeamAsync and fn=getAboutContentAsync.
- If Directus is stopped, About page and Team section still render using mocks (badge indicates MOCKS).
- No server-side framer-motion errors (motion stays in client components only).
- Typecheck and lint pass.

Implement all changes with minimal diff, following existing conventions in the repo.
