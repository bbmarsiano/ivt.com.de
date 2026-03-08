Scope: Styling/UI only. Do NOT change functionality, routing, API calls, data fetching, or component behavior. No new dependencies.

Hard rule:
- DO NOT use CSS colors #f9aa8f or #ed1c24 anywhere (backgrounds, borders, hover states, buttons, links, accents).
- Using brand PNG assets that contain red is allowed (e.g., *_red.png), because it's inside images, not CSS.

Goals:
1) Make global background FIXED (background stays still; content scrolls).
2) No per-section backgrounds; use brandbook decorative PNG elements (N/O/I + wave) as section separators/markers.
3) Replace/remove any existing usage of #f9aa8f and #ed1c24 across the codebase.
4) Add subtle modern animations (CSS-only), respecting prefers-reduced-motion.

Assets:
Use images from /public/brand/background_imgs/ (same names): N_*.png, O_*.png, I_*.png, and existing ivt_*.png.

Implementation:

A) GLOBAL FIXED BACKGROUND
- In the root layout wrapper (app/layout.tsx or global Shell), add a fixed background layer behind everything:
  - Base gradient: dark/industrial only (no pink).
    Use: near-black -> deep burgundy -> dark maroon.
    Example tokens:
      top: #050507
      mid: #120008
      bottom: #2a0010
  - Optionally overlay ivt_3.png at low opacity for texture (object-cover, object-bottom), but keep it subtle.

- Ensure content wrapper is relative and scrolls normally while background is fixed.

B) SECTION MARKERS (NO section background images)
- For each major section wrapper, add 1 decorative element (alternating):
  - top-left: N_white.png (opacity 0.06–0.10)
  - top-right: O_white.png (opacity 0.06–0.10)
  - bottom-left: I_white.png (opacity 0.06–0.10)
  - occasionally: N_red.png or O_red.png at very low opacity (0.04–0.07)
- Add wave separators between some sections using wave PNGs (black or red variants), low opacity, as a divider only.

Rules:
- Decorative images must be pointer-events-none and behind content (absolute, -z-10).
- Keep readability: section content sits on subtle translucent panels (bg-white/5 or bg-black/20 with border-white/10).

C) REMOVE FORBIDDEN CSS COLORS
- Search entire repo for "#f9aa8f" and "#ed1c24".
- Replace with more defense/industrial palette for CSS:
  - Primary accent (deep crimson): #7A0014 or #8B0A1A (pick one and use consistently)
  - Hover accent: slightly lighter deep crimson (e.g., #9B0F24) OR use opacity changes instead of color changes.
  - Neutral accents: #E5E7EB, #C7C7C7, #9CA3AF
- Ensure buttons/hover states do NOT use the forbidden hex values.
- Update Tailwind theme tokens if these colors are defined there.

D) MODERN ANIMATIONS (CSS-only)
- Add gentle floating animation for decorative PNG elements only (slow, subtle).
- Add simple fade/slide-in for sections if there is already a safe intersection observer utility; if not, only animate on initial load (hero) to avoid risky JS changes.
- Respect prefers-reduced-motion by disabling animations.

E) KEEP FUNCTIONALITY INTACT
- Do NOT change nav links, header logic, carousels, video logic, forms, CMS integration.

Deliverables:
- List modified files.
- Minimal diff.
- Confirm no functional logic changed and forbidden hex colors are fully removed from CSS usage.