Implement language persistence + CMS-driven pages + header/footer menus from Directus, matching the existing client-side LanguageContext approach (DE/EN).

Constraints:
- DO NOT introduce Next.js i18n routing, middleware, or /de /en routes.
- Keep existing LanguageContext + translations dictionary.
- Keep content model with *_de / *_en fields.
- Add-only / safe changes; do not break existing routes.
- Add clear fallbacks (if Directus is down, show existing static menus and basic error state).

Part A) Persist language (DE/EN)
1) Update lib/i18n/LanguageContext.tsx:
   - On initial mount, read language from localStorage key "ivt_lang" (values "de" | "en").
   - If present and valid, set as initial language.
   - Whenever language changes, write to localStorage.
   - Also set <html lang="..."> attribute if feasible (client-side).

2) Ensure this does not break SSR/hydration:
   - Use a safe default 'de' until mounted, or initialize state lazily.
   - Avoid accessing window/localStorage during SSR.

Part B) CMS Pages (Directus collection: pages)
We already have collection "pages" with fields:
- slug (string)
- title_de, title_en (string)
- content_de, content_en (rich text html)
- (optional) published_at

1) Add a new route: app/[slug]/page.tsx OR app/(static)/[slug]/page.tsx (choose best) that:
   - Tries to fetch a page from Directus by slug.
   - If found: render localized title + localized HTML content (dangerouslySetInnerHTML).
   - If not found: return notFound() so existing routes still work.
   - IMPORTANT: Do not shadow existing routes like /projects, /news, /events, /partners, /about.
     -> Implement a denylist: if slug is one of existing top-level routes, do not fetch pages and return notFound().

2) Add a DirectusContentService method:
   - getPageBySlug(slug): fetch /items/pages?filter[slug][_eq]=...&limit=1&fields=slug,title_de,title_en,content_de,content_en,published_at

3) Security:
   - Add a minimal HTML sanitizer option OR document that content is trusted admin-only.
   - At minimum, add a note/comment that Directus editors must be trusted.

Part C) Header/Footer menus from Directus singleton (site_settings)
We have singleton collection "site_settings" with:
- header_menu (json array of {label_de,label_en,href,visible})
- footer_menu (json array of {label_de,label_en,href,visible})

1) Add DirectusContentService method:
   - getSiteSettings(): fetch /items/site_settings?fields=header_menu,footer_menu

2) Update components/layout/Header.tsx and Footer component (wherever it lives):
   - On server or client? Prefer server-side fetch in layout if feasible; otherwise client fetch with caching.
   - Use existing language from useLanguage() and choose label_de vs label_en.
   - Filter by visible === true.
   - Fallback: if fetch fails, keep the existing hardcoded menus.

3) Make sure links work with existing routes; add external link support if href starts with http(s).

Part D) Tests / Validation commands
Provide:
- curl commands to verify Directus endpoints:
  - /items/pages?filter[slug][_eq]=privacy-policy...
  - /items/site_settings
- Manual test checklist:
  - switch language -> refresh -> stays
  - pages render correct language fields
  - header/footer labels switch with language
  - existing routes not impacted
  - denylist works

Deliverables:
- List of files changed + code changes
- Any new helper functions (e.g., getLocalizedField(content, 'title', language) with fallback to de)
