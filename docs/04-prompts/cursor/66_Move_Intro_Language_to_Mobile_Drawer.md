Open components/layout/Header.tsx

Goal:
Move Intro button and Language toggle inside the mobile Sheet (drawer).
On mobile top bar keep only:
- Logo (left)
- Hamburger button (right)

Desktop layout must remain unchanged.

Steps:

1) Locate the right-side controls container (Intro + Language buttons).
   It currently renders for all screen sizes.

2) Wrap that container with:
   className="hidden md:flex items-center space-x-2"
   So it appears only on desktop.

3) Inside the <SheetContent> (mobile drawer),
   after rendering navigation links,
   add:

   <Separator className="my-4" />

   Then render:
   - Intro button (reuse the exact same component/logic as desktop)
   - Language toggle (reuse same component/logic)

   Wrap them in:

   <div className="flex flex-col space-y-3">
       ...buttons here...
   </div>

4) Ensure:
   - Buttons inside drawer use full width:
     className="w-full justify-start"
   - Sheet closes when a navigation link is clicked.

5) Do NOT modify:
   - Desktop nav
   - CMS menu logic
   - Dropdown "Mehr"

Return full updated Header.tsx file.
Ensure no TypeScript errors.