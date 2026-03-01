Implement Footer v2 with grouped sections, localized section titles, and CMS-configurable bottom text.

Context:
- site_settings singleton already provides footer_menu (array of {label_de,label_en,href,visible})
- We added new optional fields:
  - footer_sections: array of { key, title_de, title_en, hrefs: string[] }
  - footer_copyright: { de: string, en: string }

Requirements:
1) Footer should render 3 (or N) sections based on site_settings.footer_sections order.
2) Each section title must localize based on LanguageContext (de/en), using title_de/title_en.
3) Each section shows links by matching hrefs against footer_menu entries (only visible=true).
   - If a href listed in footer_sections is missing from footer_menu, ignore it.
   - If footer_sections is null/empty, fallback to existing Footer behavior (current 3 columns).
4) Bottom copyright text should come from footer_copyright localized:
   - Use en when language==='en', else de
   - Fallback to current hardcoded text if not provided.
5) Keep external link handling as currently implemented.
6) Keep everything backward compatible.

Files:
- lib/types/content.ts: extend SiteSettings with footer_sections and footer_copyright types
- services/directusContentService.ts: ensure getSiteSettings requests these fields too (id,header_menu,footer_menu,footer_sections,footer_copyright)
- components/layout/Footer.tsx: implement grouping and localized headings + bottom text
- Any helper functions: can use getLocalizedField/getLocalizedFieldWithDefault for titles.

Add a small debug-friendly comment with example JSON structure.

Provide manual test checklist at end.
