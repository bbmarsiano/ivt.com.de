Scope: Hero stats section ONLY.
Do NOT change routing, data structure, copy text, or business logic.
No new dependencies.

Goal:
Add a premium count-up animation to the hero stats numbers only, for entries like:
- 500+
- 150+
- 50+
- €100M+

The labels under them (e.g. Projects / Partners / Startups / Investments) must remain static.

Requirements:
- Animate only the numeric part.
- Keep suffixes/prefixes visible:
  - "+" remains
  - "€" remains
  - "M+" remains
- Trigger animation once when the stats section enters the viewport.
- Respect prefers-reduced-motion.
- No external libraries.

------------------------------------------------
1) Locate the Hero stats section on the homepage
Find the block rendering the stats:
- 500+ Projects
- 150+ Partners
- 50+ Startups
- €100M+ Investments

2) Create a lightweight reusable CountUp component or inline utility
Implement with React only:
- useEffect
- useRef
- useState
- requestAnimationFrame
- optional IntersectionObserver

Behavior:
- Starts at 0
- Animates smoothly to target value over ~1.2s to 1.8s
- Runs only once when section becomes visible
- If prefers-reduced-motion is enabled, render final values immediately

3) Support these formatting cases
A) Plain integer with plus:
   target: 500
   render: "500+"

B) Integer with label:
   target: 150
   render: "150+"

C) Currency million style:
   target: 100
   render: "€100M+"

Implementation hint:
- Store config per stat:
  {
    value: 500,
    prefix: "",
    suffix: "+",
    label: "Projects"
  }
  {
    value: 100,
    prefix: "€",
    suffix: "M+",
    label: "Investments"
  }

4) Visual polish
Keep the current typography/layout, but improve visibility slightly:
- number color should be more readable against the current background
- use a high-contrast light tone or existing accent if already readable
- optional subtle text-shadow/glow if needed, but keep it premium and restrained

5) Do NOT change:
- the stat labels text
- layout structure significantly
- section spacing
- any other hero content

6) Output
- list modified files
- minimal diff
- confirm animation runs once on viewport entry and no functionality outside the stats block changed