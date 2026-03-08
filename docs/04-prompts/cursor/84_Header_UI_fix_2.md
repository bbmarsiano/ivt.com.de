Scope: Header / navigation UI only. Do NOT change menu logic, routing, hamburger behavior, or scroll detection logic.

Goal:
Ensure the SAME logo image is used both:
- when the page first loads (no scroll)
- after the page is scrolled (fixed logo state)

Currently:
The logo changes to a different asset after scrolling.

Fix:
Use the same logo asset in both states.

Required logo asset:
IVT_logo_white_horizontal@3x.png

------------------------------------------------

1) Locate header logo rendering logic.

The header currently has two visual states:
- initial header (before scroll)
- scrolled state (fixed logo + hamburger)

Find where the scrolled state swaps the logo asset.

Example pattern that might exist:

initial:
src="/brand/IVT_logo_white_horizontal@3x.png"

scrolled:
src="/brand/IVT_logo_white@3x.png"
or another compact logo.

------------------------------------------------

2) Replace the scrolled logo source.

Ensure BOTH states use:

src="/brand/IVT_logo_white_horizontal@3x.png"

Do NOT use the compact logo.

------------------------------------------------

3) Ensure layout remains correct.

If the scrolled state used a smaller logo previously:

Adjust sizing slightly instead of changing the asset.

Example:

initial:
h-10

scrolled:
h-8

But keep the SAME image file.

------------------------------------------------

4) Verify

- When page loads → horizontal white logo
- When scrolling → SAME horizontal logo stays visible
- No asset switching
- Hamburger behavior unchanged
- Menu functionality unchanged

Output:
- modified file(s)
- minimal diff
- confirm no functionality changes