Goal: Update ONLY the Home page (route "/") design + copy. Do NOT change any working functionality, data fetching, component logic, routing, or existing section integrations.

Hard constraints:
- Keep Featured Projects section as-is (same components, same data, same links).
- Keep Testimonials as-is (same rotation/logic); only update displayed text if it's hardcoded.
- Keep Latest News section as-is (same component/data).
- Keep Upcoming Events section as-is (same component/data).
- Do NOT remove or refactor existing hooks, API calls, or props.
- Avoid moving files or renaming exports.
- No breaking changes.

Steps:
1) Locate the Home page entry file for "/" (e.g., app/page.tsx, pages/index.tsx, or similar). Identify the top hero / intro area and any mission/highlights copy above the preserved sections.
2) Update the hero area to support the “German industrial power / strategic integration platform” narrative, while keeping any existing intro video behavior intact (if present). If the video component already exists, keep it; only adjust surrounding layout and text.
3) Replace ONLY the copy in hero + mission + 3 highlights cards + projects teaser intro (if any) ABOVE the preserved sections.

New copy (EN):
HERO:
- Headline: "ENGINEERING SOVEREIGN INDUSTRIAL CAPACITY"
- Subheadline: "Innovation Valley Thüringen is Germany’s strategic integration platform for advanced development, coordinated production, and resilient supply chains across critical technologies."
- Supporting text: "We orchestrate industrial collaboration across Thuringia and Germany — connecting engineering expertise, infrastructure, and manufacturing capabilities to accelerate scalable, German-based execution."
CTA buttons (keep existing button components/handlers, only change labels if labels are hardcoded):
- Primary: "Explore Our Ecosystem" (link to existing About route)
- Secondary: "View Strategic Projects" (link to existing Projects route)

MISSION (short block under hero):
"Innovation Valley Thüringen is a structured integration environment for German industrial partners. We coordinate development, industrial implementation, and scalable production readiness — strengthening sovereign execution within Germany."

HIGHLIGHTS (3 cards; keep same card components & icons, only change titles/text):
Card 1 title: "Collaborative Industrial Projects"
Card 1 text: "Structured multi-company programs accelerating development and coordinated production."
Card 2 title: "Thuringia Integration Hub"
Card 2 text: "Centralized orchestration leveraging regional expertise, infrastructure, and engineering excellence."
Card 3 title: "German-Based Execution"
Card 3 text: "Critical technologies developed and industrialized within secure, resilient national supply chains."

OPTIONAL tiny intro line above Featured Projects (ONLY if there is currently a short paragraph there; do not change the section behavior):
Headline: "Strategic Industrial Programs"
Text: "From integrated platforms to high-precision production technologies, our projects connect engineering, supply chains, and scalable execution — aligned with German industrial standards."

4) Design-only adjustments allowed (do not affect logic):
- Make the hero look more “industrial / authoritative”: stronger typography, more negative space, sharper section separation.
- Keep the site’s existing design system / components (Tailwind classes or existing UI library).
- Do not add new dependencies.
- Do not rewrite the layout architecture—only tweak classes and content blocks.

5) Output requirements:
- Show exactly which file(s) you changed.
- Provide a minimal diff.
- Confirm that Featured Projects, Testimonials, Latest News, and Upcoming Events sections remain functionally unchanged.

Now implement.