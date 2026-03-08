Scope: Styling/UI only. Do NOT change functionality, routing, API calls, data fetching, or component behavior.

Goal:
Add a subtle "defense / tactical UI" visual layer using:
1) grid overlay on the global fixed background
2) section tactical divider lines
3) vignette effect for depth

These effects must be subtle and premium, not visually noisy.

------------------------------------------------

1) GLOBAL GRID OVERLAY

Locate the fixed background layer in the root layout (app/layout.tsx or shell).

Add a grid overlay above the gradient background.

Implementation:
Create a new absolute div above the gradient layer:

className:
absolute inset-0 pointer-events-none opacity-[0.05]

Use CSS background grid:

background-image:
linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)

background-size:
80px 80px

This produces a subtle tactical grid.

Ensure it sits behind all content:
-z-40 or similar.

------------------------------------------------

2) VIGNETTE EFFECT

Add a radial vignette layer above the grid to create depth.

Create another absolute layer:

className:
absolute inset-0 pointer-events-none

background:
radial-gradient(circle at center,
transparent 40%,
rgba(0,0,0,0.35) 100%)

Low opacity so it only slightly darkens edges.

------------------------------------------------

3) SECTION TACTICAL DIVIDER

For each major section container:

Add a thin divider line at the top.

Example:

<div className="absolute top-0 left-0 right-0 h-px bg-white/10"></div>

Enhance the divider with a small accent element:

<div className="absolute top-0 left-6 w-12 h-px bg-[#7A0014]"></div>

This creates a tactical UI "system separator".

Ensure it does not affect layout.

------------------------------------------------

4) OPTIONAL MICRO ANIMATION

For divider accent element:

Add subtle glow animation:

opacity 0.7 → 1 → 0.7

duration 4s
ease-in-out
infinite

Disable if prefers-reduced-motion.

------------------------------------------------

Constraints:
- DO NOT change layout spacing
- DO NOT change functionality
- DO NOT introduce new dependencies
- DO NOT use colors #f9aa8f or #ed1c24
- Use deep crimson (#7A0014) if red accent is needed

Output:
- Files changed
- Minimal diff
- Confirmation that no functionality changed