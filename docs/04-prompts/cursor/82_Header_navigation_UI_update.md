Scope: Header / navigation UI only. Do NOT change routing, menu items, language-switch logic, or mobile menu functionality. No refactors, no new dependencies.

Goals:
1) Switch the logo from colored to white.
2) Desktop/header behavior:
   - The full header menu should NOT stay fixed while scrolling down.
   - Only the white logo image (without any text) should remain fixed.
   - Add a fixed hamburger button on the right side on desktop, using the SAME menu open/close functionality as the existing mobile menu.
3) Mobile:
   - Fix hamburger button contrast so it is visible on dark backgrounds.
   - It should use the same visual style/color system as the language switch button.
   - When the mobile menu is open, there must be only ONE close "X" button, not two.

Constraints:
- Do NOT change the actual menu links/items.
- Do NOT change menu open/close state logic, only reuse it.
- Do NOT break mobile menu behavior.
- Do NOT modify page content.
- Keep accessibility intact.

------------------------------------------------
1) LOGO: switch to white logo
- Locate the Header/logo component.
- Replace the colored logo asset with the white logo asset:
  "IVT_logo_white@3x.png"
- Use ONLY the logo mark/image, without any extra adjacent text.
- Keep sizing balanced and crisp.

------------------------------------------------
2) DESKTOP HEADER SCROLL BEHAVIOR
Current issue:
- Full header stays fixed while scrolling.

Required result:
- The full header/navigation bar should scroll away with the page.
- Only a fixed white logo remains visible.
- A fixed hamburger button appears on the right and opens the same navigation drawer/menu used on mobile.

Implementation:
A) Header container:
- Remove sticky/fixed behavior from the full header/navigation bar.
- Make it regular/relative/static so it scrolls away naturally.

B) Fixed logo:
- Create/use a fixed floating logo element:
  - position: fixed
  - top: around 16px–24px
  - left: around 16px–24px
  - z-index high enough to stay above content
- Use the white logo image only.
- Keep it compact and elegant.

C) Fixed desktop hamburger:
- Add a fixed button on the right side:
  - position: fixed
  - top aligned with fixed logo
  - right: around 16px–24px
  - z-index high enough
- This button must trigger the SAME existing menu open action/state as the mobile hamburger.
- Do NOT create a new menu system.
- Reuse the existing mobile menu drawer/panel if possible, also for desktop.

D) Desktop hamburger styling:
- Match the visual system of the language switch button:
  - same surface/background treatment
  - same border
  - same hover invert behavior
- Keep it modern, minimal, and readable on the dark background.

------------------------------------------------
3) MOBILE HAMBURGER / CLOSE BUTTON FIXES
A) Hamburger contrast:
- Locate the mobile hamburger button.
- Its background/style should match the language switch button style.
- Ensure the hamburger lines/icon are visible:
  - icon must use currentColor
  - text/icon color should not be white on white
- Use the same button system as language switch:
  default:
    bg-white/5
    border border-white/10
    text-white/80
  hover:
    bg-white
    text-black

B) Duplicate close button:
- When the mobile menu opens, there are currently two "X" close buttons.
- Remove the duplicate so only ONE close button remains visible.
- Keep the existing close behavior; do not change functionality.
- Ensure the remaining close button is positioned clearly and styled consistently with the hamburger/language buttons.

------------------------------------------------
4) VERIFY
- Full header scrolls away normally.
- Fixed white logo remains visible.
- Fixed hamburger on desktop opens the same menu as mobile.
- Mobile hamburger is visible and styled correctly.
- Only one close "X" button appears when menu is open.
- No routing or menu behavior changes.

Output:
- List modified files
- Minimal diff
- Confirm functionality unchanged except the intended header visibility/presentation behavior.