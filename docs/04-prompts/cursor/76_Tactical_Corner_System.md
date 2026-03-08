Scope: Styling/UI only. Do NOT change functionality, routing, data fetching, or component behavior. No new dependencies.

Goal:
Add subtle “tactical corner markers” (engineering/defense UI framing) to:
- major section panels
- key cards (feature cards, project cards, news cards, testimonial cards if they have a panel)

Do NOT apply to:
- buttons
- form inputs
- small chips/badges

Rules:
- Markers must be subtle and premium (not heavy borders).
- Must not change layout spacing or dimensions.
- Must respect prefers-reduced-motion (hover effects still ok, but no motion required).

Implementation:

1) Add reusable CSS utilities in globals.css (or equivalent global stylesheet):
Create a class: `.ivt-frame`

- Parent requirements:
  - position: relative;
  - overflow: hidden; (only if already used; do not introduce clipping issues)
- Create 4 corner “L” markers using pseudo-elements plus an inner helper span if needed.
  Preferred: use multiple linear-gradients as background to avoid extra DOM.

Option A (recommended): background gradients for corners
- Use 4 gradients to draw corner lines (top-left, top-right, bottom-left, bottom-right).
- Thickness: 1px
- Corner length: 16px
- Color: rgba(255,255,255,0.14)

Example CSS approach:
- background-image: linear-gradient(...), linear-gradient(...), ...
- background-size: 16px 16px
- background-position: top left, top right, bottom left, bottom right
- background-repeat: no-repeat

2) Add hover state for cards:
Create `.ivt-frame-hover`:
- On hover: increase corner opacity slightly (e.g., from 0.14 to 0.24)
- Add subtle shadow/ring: ring-1 ring-white/10 (optional)
- Transition: 200ms

3) Apply classes:
- Add `ivt-frame` to section panel containers (the translucent panels).
- Add `ivt-frame ivt-frame-hover` to cards (project/news/feature cards).
- Ensure the class is not applied to containers that would look cluttered.

4) Verify:
- No layout changes
- No clipped content
- Corners visible but subtle on dark background

Output:
- Files changed
- Minimal diff
- Confirm no functionality changes.