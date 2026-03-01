Upgrade the homepage to use the same mock data sources and feel fully cohesive with the rest of the site.

Scope:
1) Create mock datasets:
   - lib/mock/testimonials.ts
   - lib/mock/news.ts
   - lib/mock/events.ts

Each dataset must be bilingual (DE/EN) and match a future CMS-friendly shape:
- Testimonials: id, quote_de, quote_en, author_name, author_title_de/en, company_name, company_logo(optional), featured(bool)
- News: id, slug, title_de/en, summary_de/en, published_at (ISO), cover(optional), tags(array)
- Events: id, slug, title_de/en, description_de/en (short), location, start_at, end_at, cover(optional)

2) Homepage sections (use existing homepage layout but make data-driven and premium):
   A) Hero area under intro overlay:
      - Use bilingual mission statement (existing)
      - Add 3 highlight cards (Collaborative Projects / Thuringia Hub / Made in Germany) if not already present.
   B) Featured Projects carousel:
      - Pull from lib/mock/projects.ts where featured=true.
      - Show 3-4 items in a premium carousel (shadcn/ui + motion).
      - Each item links to /projects/[slug].
   C) Testimonials:
      - Rotating slider of featured testimonials (auto-rotate optional).
      - Show quote + author + company.
   D) News teaser:
      - Show latest 2-3 news posts (sorted by published_at desc).
      - Each links to /news (and optionally /news/[slug] if exists; if not, link to /news).
   E) Events teaser:
      - Show upcoming 2-3 events (sorted by start_at asc and only future dates).
      - Each links to /events (and optionally /events/[slug] if exists; if not, link to /events).
   F) Primary CTA:
      - Button: "Explore Our Ecosystem" (DE equivalent), linking to /about.

3) Reusable components:
   - components/home/FeaturedProjectsCarousel.tsx
   - components/home/TestimonialsSlider.tsx
   - components/home/NewsTeaser.tsx
   - components/home/EventsTeaser.tsx
Keep styles consistent with existing premium design system.

4) i18n:
   - All headlines, buttons, labels must be translated and use the existing i18n mechanism.

Constraints:
- No backend/CMS integration yet.
- Use placeholder images if needed.
- Ensure no runtime errors and keep code clean.

Deliverable:
- Homepage feels complete and is fully driven by the mock data sources.
- Featured projects carousel, testimonials slider, news and events teasers all work.
