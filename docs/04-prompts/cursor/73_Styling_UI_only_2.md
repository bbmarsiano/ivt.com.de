Scope: Styling/UI only. Do NOT change functionality, routing, API calls, or component behavior. No refactors.

Goals:
A) Section decorative PNG elements:
  1) Alternate positioning per section: section 1 LEFT, section 2 RIGHT, section 3 LEFT, section 4 RIGHT, etc. Continue to end.
  2) Decorative images must OVERLAP sections (absolute positioning) and must NOT push content down. Remove any layout-affecting spacing/margins created by these decorations.
  3) Use mixed variants (white/black/red PNGs) for variety (not only one color), but keep opacity subtle.
  4) For I_* images (I_black/I_red/I_white): add inner offset from the edge (left or right depending on position) so it clearly reads as a design element, not a page border. (e.g., inset-x with extra padding like left-6/right-6 or translate-x)
B) Apply the same “darkened section panel” background style to all pages (not only home).
C) Header: switch to the COLORED logo (the color version already in project assets). Keep header functionality unchanged.
D) Keep fixed global background as is.

Implementation details:

1) DECORATIONS: Alternating positioning + overlap
- Locate where section decorations are added (home page sections and/or shared Section wrapper component).
- Ensure each section wrapper is `relative overflow-hidden`.
- Ensure each decoration is an absolutely positioned element:
  - className must include: "absolute pointer-events-none select-none -z-10"
  - DO NOT use padding/margin on the section container to make room for it.
  - Use negative offsets if needed to overlap outside the section bounds without affecting layout:
    Example:
      Left side:  left-[-40px] top-6
      Right side: right-[-40px] top-6
    Adjust to look clean.

- Implement alternating logic:
  If sections are manually coded: alternate the classes per section.
  If there is a reusable component: add a prop `decorationSide` or compute index parity and set side classes accordingly.
  Pattern: odd index => left, even index => right (or vice versa), consistent across page.

2) DECORATIONS: Color variety
- For each section decoration choose from:
  N_white / O_white / I_white
  N_black / O_black / I_black
  N_red / O_red / I_red (very low opacity)
- Rotate variants by section index:
  Example suggestion:
    Section 1: N_white (opacity 0.08)
    Section 2: O_black (opacity 0.06)
    Section 3: I_white (opacity 0.07)
    Section 4: N_red (opacity 0.05)
    Section 5: O_white (opacity 0.08)
    Section 6: I_black (opacity 0.06)
  (Use whichever sections exist; just ensure mixed colors.)

- Keep opacity subtle: 0.04–0.10 max.

3) I_* padding/offset requirement
- For any I_* decoration, add extra inset from the edge so it is not flush with viewport:
  If on left: use left-[-20px] BUT also add translate-x or padding so it’s visibly “inside”, e.g. left-[-20px] + pl-6 is not possible on image; instead:
    - set left-[-20px] and add a wrapper div with padding-left, or
    - set left-[-20px] and apply translate-x(12px) using Tailwind: "translate-x-3"
  If on right: symmetrical: right-[-20px] and "-translate-x-3" (or translate-x negative)
- End result: the I-shape should feel intentionally placed, not like a border.

4) DARK SECTION PANELS ON ALL PAGES
- Identify the section panel style used on home (e.g., bg-black/20 or bg-white/5 + border-white/10 + rounded).
- Apply the same wrapper style to all main page sections across the site:
  - About, Projects, Partners, News/Events, Resources, Contact, Why pages, etc.
- Do NOT change content or functionality; only wrap existing content blocks with the same panel class, or update existing container classes.
- Ensure spacing remains consistent.

5) HEADER: colored logo
- Locate header logo import/usage.
- Switch from monochrome to the colored logo asset already used elsewhere (or in public).
- Keep dimensions and layout stable (no functional changes). If needed, slightly adjust height to match existing header spacing.
- Do NOT modify links or header behavior.

Output:
- List modified files.
- Minimal diff.
- Confirm: decorations overlap without shifting layout; alternating left/right achieved; color variety applied; I_* offset fixed; panels applied sitewide; header uses colored logo; functionality unchanged.