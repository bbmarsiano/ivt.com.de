Scope: Header / navigation UI only. Do NOT change routing, menu items, language logic, intro logic, or hamburger functionality.

Goals:
1) Initial page load (before any scroll):
   - Keep the original full header visible exactly as it is now.
   - Keep using the horizontal white logo asset:
     "IVT_logo_white_horizontal@3x.png"
2) After scroll begins:
   - Keep the fixed logo visible as it is now.
   - Keep the fixed hamburger button visible as it is now.
3) When the hamburger menu is opened after scroll:
   - Fix the Intro button color
   - Fix the language switch button color
   - They are currently white on white / low-contrast and not readable.
   - Make them readable and visually consistent with the hover/button system already used elsewhere.

Constraints:
- Do NOT change functionality.
- Do NOT change menu open/close logic.
- Do NOT change which logo is used in the initial header.
- Do NOT change menu links/items.
- Only styling/state presentation adjustments.

------------------------------------------------
1) INITIAL HEADER STATE
- Locate the header logic that renders:
  a) the initial full header before scroll
  b) the fixed scrolled state (logo + hamburger)
- Keep the initial pre-scroll header exactly as the current variant:
  - visible menu
  - intro button
  - language switch button
  - horizontal white logo:
    IVT_logo_white_horizontal@3x.png

Do NOT replace it with the compact fixed logo in the initial state.

------------------------------------------------
2) SCROLLED / HAMBURGER MENU OPEN STATE
- Locate the menu panel/drawer that opens when the fixed hamburger button is pressed.
- Find the Intro button and the language switch button inside that opened menu/drawer.
- Update ONLY their styling so they are clearly visible on the menu background.

Use the same button visual system already established for readable utility buttons:

Default:
- bg-black/10 OR bg-white/10 (choose whichever contrasts best with the open menu background)
- border border-black/10 OR border-white/15 depending on background
- text-gray-900 on light menu background
- OR text-white/90 on dark menu background

Hover:
- if menu background is light:
  hover:bg-black
  hover:text-white
- if menu background is dark:
  hover:bg-white
  hover:text-black

IMPORTANT:
- Ensure icons inherit currentColor (text-current).
- Remove any hardcoded white icon/text classes inside these two buttons if they conflict.

------------------------------------------------
3) VERIFY
- Before scroll: original full header remains unchanged and uses IVT_logo_white_horizontal@3x.png
- After scroll: fixed logo + hamburger remain as currently implemented
- When hamburger menu opens: Intro and language buttons are readable and styled correctly
- No duplicate controls
- No behavior changes

Output:
- List modified files
- Minimal diff
- Confirm no functional changes.