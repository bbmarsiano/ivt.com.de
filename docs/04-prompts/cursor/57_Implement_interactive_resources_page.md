Implement interactive /resources page using Directus resources.kind categorization.

Context:
- Directus collection `resources` now has optional field `kind` with values:
  document | video | download | guide
- Existing business rules:
  - Public resources are downloadable directly (ignore gated)
  - On /resources page we must NOT expose gated downloads; show only public resources.
- We already have services:
  - getPublicResources (returns public resources)
  - getProjectsAsync and project resources fetching exists
  - LanguageContext selects *_de/*_en

Requirements:
1) Update types:
   - lib/types/content.ts Resource type must include `kind?: string | null`.

2) Update Directus fetch fields:
   - services/directusContentService.ts:
     - Wherever resources are fetched for /resources page, include `kind` in fields.
     - Ensure no extra forbidden fields are requested.

3) /resources page UI:
   - Current 4 cards: Documents, Videos, Downloads, Guides
   - Make each card clickable:
     - Clicking sets activeCategory and renders a modern list section below:
       * heading localized
       * list items show localized resource title (title_de/title_en)
       * each item uses existing “public vs gated” UI rules (only public displayed here)
   - Add a localized link/button near cards: 
       DE: "Alle Ressourcen ansehen"
       EN: "View all resources"
     Clicking shows all categories expanded (with headings + lists).

4) Filtering rules:
   - For Documents/Videos/Guides: show resources where kind matches.
   - For Downloads:
     A) Public downloads: resources where kind=='download' AND gated==false AND visible==true
     B) Project downloads: for each project, show resources linked to that project where kind=='download' AND gated==false AND visible==true
        - Group by project (use project title localized)
        - Do not show gated resources
   - If a resource has no `kind`, it should NOT appear in any category list (to keep it clean).

5) UX polish:
   - Smooth expand/collapse (simple CSS transition ok)
   - Empty state per category: “No resources yet” localized (DE/EN).
   - Keep existing layout/styling consistent with site.

Deliverables:
- Summary of changed files
- Manual test checklist
