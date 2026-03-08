Scope: Styling/UI only. Do NOT change functionality, routing, data fetching, or component behavior. No new dependencies.

Goal:
Make iconography consistent across the whole site (header, buttons, cards, lists, metadata rows).
Consistency targets:
- same visual weight (stroke)
- consistent sizes per context
- consistent color/opacity on dark UI
- consistent spacing/alignment with text
- predictable hover behavior (subtle)

Constraints:
- Do NOT replace icon library unless already multiple are used (prefer current).
- Do NOT change icon meaning or placement logically.
- Do NOT introduce new colors (#f9aa8f, #ed1c24 forbidden).
- Respect prefers-reduced-motion (no icon animations required).

Implementation Plan:

1) INVENTORY CURRENT ICON USAGE
- Search for icon imports/usages:
  - lucide-react (common): "from 'lucide-react'"
  - heroicons/react, react-icons, inline SVGs
- Do not refactor large structures; only normalize props/classes.

2) DEFINE ICON “TOKENS” (CSS/Tailwind utilities)
Create reusable utility classes in globals.css (or a shared styles file), e.g.:

- .ivt-icon          (default icon)
- .ivt-icon-sm       (small, metadata)
- .ivt-icon-md       (buttons, nav)
- .ivt-icon-lg       (feature cards / hero highlights)

Target sizing:
- sm: 14–16px
- md: 18–20px
- lg: 24–28px

Target styling:
- stroke width: 1.5 (or 1.75) consistently
- color on dark: text-white/70 (default), text-white/90 (emphasis)
- alignment: translate-y-[1px] if needed for baseline matching

Example (Tailwind-based classes):
- .ivt-icon-sm { @apply w-4 h-4 text-white/60; }
- .ivt-icon-md { @apply w-5 h-5 text-white/70; }
- .ivt-icon-lg { @apply w-7 h-7 text-white/80; }

If icons are SVG components (e.g., lucide), ensure:
- set strokeWidth={1.5} globally where possible
- or apply a wrapper utility via className and a consistent prop passed.

3) APPLY ICON TOKENS BY CONTEXT
A) Buttons:
- Any icon inside a button should use .ivt-icon-md
- Add consistent gap: gap-2
- Ensure arrow icons align (no jumping): apply "relative top-[1px]" only if needed.

B) Metadata rows (date/location in cards):
- Use .ivt-icon-sm
- Keep text color consistent: text-white/60 (or current token)
- Ensure spacing: gap-2

C) Feature/highlight cards:
- Use .ivt-icon-lg for the main icon
- Keep icon container consistent (optional):
  - subtle chip bg: bg-white/5 border-white/10 rounded-md p-2

D) Header/Nav icons (language switch, intro icon, etc.):
- Use .ivt-icon-md
- Same opacity as nav text.

4) HOVER/FORCUS CONSISTENCY (subtle)
- On hover of links/cards, icons should follow text:
  - default: text-white/60–70
  - hover: text-white/90
- No color pop; just opacity shift.
- Ensure transitions: transition-colors duration-150 ease

5) CLEANUP EDGE CASES
- If any icons are too thick/thin, set strokeWidth consistently.
- If mixed icon sets exist, normalize sizes via className tokens even if libraries differ.
- Avoid changing SVG paths; only style/props.

Output:
- List modified files.
- Minimal diff.
- Confirm no functional changes and icons now follow consistent sizing/color rules sitewide.