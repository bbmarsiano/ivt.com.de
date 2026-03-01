Fix Directus CMS pages + site_settings fetch issues.

Context:
- /test-page returns 404.
- Server log shows Directus 403: cannot access fields "createdAt", "updatedAt" in collection "pages".
- getSiteSettingsAsync logs found=false even though site_settings singleton exists (id=1).

Goals:
A) Fix getPageBySlug to NEVER request createdAt/updatedAt (or any non-whitelisted fields).
B) Fix getSiteSettings to correctly parse Directus singleton responses and mark found=true when data exists.
C) Keep changes minimal and safe.

Steps:

1) services/directusContentService.ts
   - In getPageBySlug(slug):
     * Build endpoint with explicit fields ONLY:
       slug,title_de,title_en,content_de,content_en,published_at
     * DO NOT include createdAt/updatedAt.
     * Ensure it works with Directus returning { data: [...] }.
   - In getSiteSettings():
     * Use endpoint: /items/site_settings?fields=id,header_menu,footer_menu
     * Parse singleton shape: Directus returns { data: { ... } } (NOT array).
     * Return SiteSettings | null properly.

2) services/contentService.ts
   - Ensure getPageBySlugAsync and getSiteSettingsAsync treat:
     * pages: array response
     * site_settings: singleton object response
   - Improve logging:
     * For getSiteSettingsAsync: log found=true when id exists.

3) app/[slug]/page.tsx
   - Confirm it uses getPageBySlugAsync and does not request extra fields.
   - published_at check:
     * If published_at is null, allow rendering in development (NODE_ENV==='development')
     * In production keep strict check (require published_at).

4) Add verification commands to docs or comments:
   - curl endpoints above
   - manual test: /test-page should render.

Deliverables:
- List of changed files
- Confirm no requests contain createdAt/updatedAt for pages or site_settings
