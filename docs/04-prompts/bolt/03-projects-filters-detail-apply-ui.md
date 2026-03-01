Enhance the Projects experience to be production-quality (UI/UX only, no backend).

Scope:
1) Projects listing page (/projects):
   - Use mock projects data (bilingual DE/EN) with realistic fields to match future CMS needs:
     id, slug, status (ongoing/completed), industry (tech/manufacturing/green_energy/defense/other),
     title_de/title_en, summary_de/summary_en, thumbnail (use placeholder images), tags (array), featured (bool),
     coordinator (name/title), and metrics (optional).
   - Add filter UI:
     - Industry filter (multi-select or single-select)
     - Status filter (ongoing/completed/all)
     - Search input (filters by title/summary)
     - Sort dropdown (Newest, Featured, Title A-Z)
   - Display results as a premium responsive grid of cards.
   - Each card shows: title, short summary, status pill, industry label, and "Learn more".
   - Clicking card goes to /projects/[slug].

2) Project detail page (/projects/[slug]):
   Build a strong template with sections:
   - Hero: title, status, industry, short summary, CTA "Apply"
   - Project description (rich text style block)
   - Image gallery section (grid with lightbox modal; can use placeholder images)
   - Documents section (list with file icons; mock items with filenames)
   - Project coordinator section (card with avatar placeholder + name/title + contact placeholder)
   - "Who can participate" section (bullets)
   - Sticky side panel (on desktop) with quick facts (status, industry, tags) and Apply button

3) Apply modal (UI only):
   - Clicking Apply opens a modal form with required fields:
     Company name
     Company email
     Company website
     Contact person
     Contact details
     Free text message
   - All fields are mandatory and must validate on client side:
     - email format
     - website URL format
     - non-empty for all
   - On submit (UI only):
     - show loading state for 1.5s (simulate)
     - then show success message exactly:
       "Email been send for application confirmation. Please confirm by click on the link in the email"
   - Provide "Close" / "Cancel" behavior, and allow reopening without page refresh.

4) i18n:
   - All labels, filter names, buttons, headings, validation errors, and success message must be translated (DE default, EN toggle).
   - Keep existing i18n approach and extend translations.

5) Code quality / structure:
   - Put mock projects data in a dedicated file: lib/mock/projects.ts (or similar).
   - Create reusable components:
     - ProjectCard
     - ProjectFilters
     - ApplyModal
     - GalleryLightbox (simple)
   - Keep styles consistent with existing premium design system (shadcn/ui).
   - No backend integration, no Directus yet.

Deliverable:
- /projects page feels complete and professional with filters working.
- /projects/[slug] page template is complete with sections above.
- Apply modal validates and shows success UI message after simulated submit.
