Scope: UI polish only. Do NOT change functionality, routing, data fetching, CMS integration, or component behavior. No refactors. No new dependencies.

Goal:
Upgrade the visual system to “€200M defense startup” level:
- stronger hierarchy
- consistent spacing rhythm
- premium micro-interactions
- industrial/defense-grade UI language
- keep current fixed background + grid + brand elements

Constraints:
- Do NOT change copy (unless it’s purely decorative labels).
- Do NOT change nav items, links, or data.
- Do NOT introduce new fonts or libraries.
- Do NOT use CSS colors #f9aa8f or #ed1c24.

Deliverables:
- A consistent design pass across Header, Section headers, Cards, Buttons, Footer.

Implementation Checklist:

A) TYPOGRAPHY & HIERARCHY
1) Standardize section titles:
   - Title: text-white/90 font-bold tracking-tight
   - Subtitle: text-white/60
   - Add consistent spacing: title -> subtitle -> content (e.g., mt-2, mt-6)
2) Ensure body text uses consistent leading (leading-relaxed) and max widths (max-w-3xl where appropriate).

B) SPACING RHYTHM
1) Standardize section padding:
   - Mobile: py-12
   - Desktop: py-20 (or similar)
2) Standardize container widths:
   - Use existing container pattern; ensure consistent max-w and px.

C) HEADER (premium defense nav)
1) Ensure sticky, translucent gradient, subtle border, and improved nav readability.
2) Improve nav link style:
   - uppercase, tracking-wide
   - hover underline / subtle “signal” accent line
3) Add a subtle bottom “status line” (1px) inside header using white/10 and a small deep-crimson accent segment.
   (No functionality change.)

D) SECTION “LABEL CHIPS” (optional, decorative only)
Add small, subtle labels at the top-left of major sections (NOT changing copy content):
Examples (choose 3–5 and reuse consistently):
- “BRIEFING”
- “PROGRAMS”
- “ECOSYSTEM”
- “UPDATES”
- “OPERATIONS”
Style:
- text-xs uppercase tracking-widest
- bg-white/5 border-white/10 rounded
- text-white/60
These labels are purely decorative and must not affect layout significantly.

E) CARDS (industrial UI)
1) Apply consistent card surface:
   - bg-black/20 (or bg-white/5)
   - border border-white/10
   - ivt-frame (if implemented)
2) Hover:
   - subtle lift: -translate-y-0.5 (optional)
   - shadow-lg
   - border-white/20
   - no bright color shifts

F) BUTTONS (micro-interactions, consistent)
1) Primary button hover:
   - ring-1 ring-white/15
   - shadow
   - slight lift
2) Secondary button hover:
   - bg-white/5
   - border-white/20
3) Keep focus-visible rings accessible.

G) FOOTER (match header system)
1) Headings white, uppercase tracking-wide
2) Links text-white/70 hover text-white
3) Add subtle divider lines consistent with header.

H) MOTION (subtle)
1) Ensure prefers-reduced-motion is respected.
2) Decorative assets float very subtly (optional).
3) No heavy animations.

Execute:
- Make minimal, high-impact class changes.
- Apply consistently across pages (home + strategic pages + content pages).
- Show modified files + minimal diffs.
- Confirm no functionality changes.