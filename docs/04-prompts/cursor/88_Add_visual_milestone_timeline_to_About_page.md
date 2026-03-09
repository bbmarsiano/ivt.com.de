Scope: About page only.
Do NOT change routing, existing page logic, or data fetching.
Add a visual milestone timeline section below the 4 cards.

Goal:
Replace the plain text placeholder about milestones with a proper visual infographic/timeline element.

Requirements:
- This is a DESIGN element, not just plain text.
- It must match the current IVT visual style:
  - modern
  - dark / defense / industrial
  - subtle tactical UI feel
- Responsive on desktop and mobile
- No new dependencies unless absolutely necessary
- Keep implementation simple and reversible

Timeline content:
1) 2024 — Launch of Innovation Valley Thüringen
2) 2025 — First project completion
3) 2026 — Expansion of strategic partnerships
4) 2030 — Established integrated industrial hub

Implementation idea:
Create a horizontal timeline on desktop and a vertical stacked timeline on mobile.

Desktop:
- a thin horizontal line
- 4 milestone nodes evenly spaced
- each node has:
  - year
  - title / short description
  - subtle circular or framed marker
- use current defense-style borders / tactical corners if appropriate

Mobile:
- vertical timeline
- milestone nodes stacked
- line on the left side with markers

Visual style:
- line: subtle white/gray line with low opacity
- nodes: white/dark framed chips or circular indicators
- year: white, bold
- description: light gray
- use the same panel/card style already present on the site
- optional subtle hover effect on milestone cards
- optional small brand accent in deep crimson, but no bright red backgrounds

Structure:
- Add a section heading above the timeline, for example:
  "Milestones"
- If using i18n, add EN/DE support

Suggested DE translations:
1) 2024 — Start von Innovation Valley Thüringen
2) 2025 — Erster Projektabschluss
3) 2026 — Ausbau strategischer Partnerschaften
4) 2030 — Etablierter integrierter Industrie-Hub

Constraints:
- Do NOT remove the 4 value cards above.
- Add the timeline directly below them.
- Do NOT turn this into a carousel/slider.
- Keep it static and elegant.

Output:
- show modified files
- minimal diff