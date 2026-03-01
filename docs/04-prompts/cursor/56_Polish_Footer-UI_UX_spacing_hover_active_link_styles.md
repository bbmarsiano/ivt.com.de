Polish Footer UI/UX: spacing, hover, active link styles.

Constraints:
- Keep existing CMS-driven footer sections logic.
- Minimal changes, no layout breakage.

Tasks:
1) components/layout/Footer.tsx
   - Add improved spacing:
     * Increase vertical gap between section title and links
     * Add consistent gap between links
     * Make columns align nicely on desktop; stack nicely on mobile
   - Add hover styles on links (subtle underline/opacity).
   - Add active link style:
     * Determine current pathname using next/navigation usePathname() (Footer is likely client component; if not, convert only the small links area to client or pass pathname from parent).
     * If current pathname matches href (exact match), apply active class (e.g., font-semibold + underline or higher opacity).
     * For external links, do not mark active.
   - Ensure accessibility: focus-visible ring/underline.

2) If Footer is a server component and cannot use usePathname():
   - Create a small client component FooterLinksClient that receives:
     * sections (already computed)
     * language
   - It uses usePathname() to apply active styles.
   - Keep server fetching intact.

Deliverables:
- Summary of changes
- Manual checks:
  - Active link highlights correctly on /privacy-policy, /projects, etc.
  - Hover/focus states visible
  - Mobile spacing OK
