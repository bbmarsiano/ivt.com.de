Scope: UI styling only. Do NOT change functionality, routing, data fetching, or component behavior. No refactors. No new dependencies.

Problem:
- Alternating section decorations (N/O/I PNGs) show no visible difference.
- Decorations may be affecting layout (pushing sections down) instead of overlapping.
- I_* decorations look like an unfinished border (flush to edge).
- Dark section panel style is not applied on other pages consistently.
- Footer menu headings are too gray and not readable on dark background.

Tasks:

1) Make decorations clearly visible and alternating LEFT/RIGHT
- Locate where the decorative PNG elements are added (Home page sections and any shared Section wrapper component).
- Ensure EACH major section wrapper is `relative` and does NOT add margin/padding to make room for decorations.
- Decorations MUST be absolutely positioned and overlapping:
  - Use: className includes "absolute pointer-events-none select-none"
  - Must NOT be in normal document flow.
  - Must NOT add extra spacing.

- Implement alternating positioning:
  - Section 1: LEFT
  - Section 2: RIGHT
  - Section 3: LEFT
  - Section 4: RIGHT
  ...continue
  (If the page uses an array/map, use index parity. If manually coded, alternate per section.)

- Ensure they are BEHIND content but still visible:
  - Use z-index like: "z-0" for decoration and "relative z-10" for content
  - Avoid too-negative z-index that hides behind the global background.
  - Increase opacity to a visible-but-subtle range: 0.07–0.12

- Suggested safe layering inside each section:
  <section className="relative overflow-hidden">
    <div className="absolute ... z-0 opacity-10"> (decoration Image) </div>
    <div className="relative z-10"> (section content) </div>
  </section>

2) Ensure decorations do not push layout
- Remove any spacing utilities that were added to accommodate decorations (like extra padding-top, margin-top).
- Decorations must overlap and not affect layout height.

3) Fix I_* offset so it does not look like a border
- When using I_black/I_white/I_red:
  - If on LEFT: do NOT place it flush at x=0. Add an inset/offset so it looks intentional:
    e.g. left-[-24px] + translate-x-6 (or left-6)
  - If on RIGHT: right-[-24px] + -translate-x-6 (or right-6)
- Goal: the I element should be clearly inside the composition, not masquerading as the page edge.

4) Apply dark section panels site-wide (all pages)
- Identify the existing “darkened panel” style used on Home sections (bg-black/20 or bg-white/5 + border-white/10 + rounded).
- Apply the same panel wrapper to main content blocks across:
  /about, /projects, /partners, /news-events, /resources, /contact, /why-thuringia, /why-now, /impact, /goals
- Only wrap existing content containers or adjust their classes. Do NOT alter content or logic.
- Ensure backgrounds remain transparent enough so the fixed global background is visible.

5) Footer headings: make them white and readable
- Locate the Footer component.
- For footer section headings (menu group titles like "Company", "Resources", etc.):
  - Set text color to white (e.g., text-white or text-white/90).
  - Increase font-weight slightly (e.g., font-semibold).
  - Keep link items slightly dimmer (e.g., text-white/70) with hover to text-white.
- Do NOT change footer links or structure.

Output:
- List exact files changed.
- Provide minimal diff.
- Confirm no functionality changes.