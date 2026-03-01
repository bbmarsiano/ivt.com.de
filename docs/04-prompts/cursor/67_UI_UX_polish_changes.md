Open these files and apply ONLY UI/UX polish changes (no data/model/logic changes):
- components/layout/Header.tsx
- components/layout/Footer.tsx (only if needed for consistency of focus/links)
- app/globals.css (only if needed for shared nav styles)

Goals:
A) Header sticky polish
1) Keep sticky header but improve visual behavior:
   - subtle shadow appears only when scrolled (no heavy constant shadow)
   - keep existing backdrop-blur behavior
2) Improve spacing:
   - desktop nav spacing slightly tighter and more “corporate”
   - mobile top bar stays minimal (logo + hamburger)
3) Improve nav link states:
   - hover: smooth color + subtle underline animation
   - active/current route: clearly indicated (underline or stronger color)
   - focus-visible: strong accessible ring, no ugly outlines
4) Dropdown “Mehr”:
   - hover/focus-visible consistent
   - dropdown panel: nicer padding, border, shadow, rounded corners
   - keyboard accessible (Tab/Enter) without breaking existing logic

B) Mobile drawer polish
1) Mobile nav links:
   - bigger tap targets (min-h, padding)
   - clear active state
   - close sheet on click remains
2) Intro + Language block:
   - grouped section with subtle background or border
   - keep full width buttons
3) Add a top title row inside drawer:
   - left: small BrandLogo icon or text "Menu"
   - right: close button (if not already present via Sheet)
   - do not change Sheet component behavior

Implementation constraints (important):
- Do NOT change CMS menu fetching, denylist logic, language logic, or routing.
- Do NOT change which links appear—only how they look and behave visually.
- Keep existing components (Button, Sheet, etc.) and Tailwind conventions.
- Use `usePathname()` in Header.tsx (if not already) to mark active link.
- If routes have trailing slashes or query params, normalize safely.
- Active state should work for "/" and nested routes (e.g., "/projects" active when pathname startsWith("/projects")).

Suggested design (Tailwind):
- Nav link base: text-sm font-medium, muted by default, foreground when active
- Underline animation: use pseudo-element or bg gradient line with `after:` utilities
- Focus-visible: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`
- Sticky shadow on scroll: implement minimal client-side state in Header.tsx:
  `const [scrolled,setScrolled]=useState(false); useEffect(()=>{...})`
  Add class: `shadow-sm` only when scrolled.

Deliverables:
1) Update Header.tsx with these polish changes.
2) If you add helper classes to globals.css, keep them scoped (e.g. `.nav-link`).
3) Provide final code diffs (or full files) with no broken imports.
4) Ensure responsive behavior remains correct.