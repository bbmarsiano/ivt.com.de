Prepare the project for export to Cursor by performing an export-ready cleanup and standardization.

Goals:
- Keep all existing UI and behavior unchanged.
- Improve structure and consistency so the codebase is easy to continue in Cursor.
- No backend/CMS integration yet.

Tasks:
1) Standardize folder structure:
   - components/ (group by domain: home/, projects/, layout/, common/)
   - lib/ (i18n/, mock/, utils/, validators/)
   - services/ (prepare for future data fetching)
   Ensure imports are consistent and avoid deep relative paths where possible.

2) Unify mock data access behind a single service layer:
   - Create services/contentService.ts with functions:
     getFeaturedProjects()
     getProjects(filters)
     getProjectBySlug(slug)
     getTestimonialsFeatured()
     getLatestNews(limit)
     getUpcomingEvents(limit)
   These functions currently return data from lib/mock/*, but MUST be structured so later we can swap to Directus without changing UI components.

3) Add client-side validators in one place:
   - Move email/url/required validation into lib/validators/
   - ApplyModal should use these shared validators.

4) Add environment skeleton:
   - Create .env.example with placeholders for future:
     NEXT_PUBLIC_SITE_URL=
     NEXT_PUBLIC_DEFAULT_LOCALE=de
     NEXT_PUBLIC_SUPPORTED_LOCALES=de,en
     DIRECTUS_URL= (placeholder)
     DIRECTUS_TOKEN= (placeholder)
     RESEND_API_KEY= (placeholder)
   - Do NOT require these env vars to run yet.

5) Add simple "PROJECT_READY_FOR_CURSOR.md" at repo root:
   - Short checklist of what exists
   - What remains (Cursor этапи: db/email/directus)
   - How to run locally

Constraints:
- Do not introduce breaking changes.
- Keep the current premium UI and all pages working.
- Keep SSR safe behavior intact.
- No new dependencies unless absolutely necessary.

Deliverable:
- Same website behavior, but cleaner codebase with a contentService abstraction and shared validators.
