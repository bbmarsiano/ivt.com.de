You are working in a Next.js App Router project.

GOAL:
Introduce a reusable BrandLogo component using assets from /public/ivt
Integrate it safely into Header and Footer WITHOUT breaking existing layout or logic.

STRICT RULES:
- Add new files only.
- Modify Header.tsx and Footer.tsx minimally.
- Do not change routing logic.
- Do not change CMS logic.
- Do not remove any existing functionality.
- Keep everything backward compatible.

-----------------------------------
STEP 1: Create BrandLogo component
-----------------------------------

Create file:
components/brand/BrandLogo.tsx

Content:

- Use next/image
- Accept props:
  variant: "light" | "dark"
  lockup: "horizontal" | "stacked" | "icon"
  className?: string
  priority?: boolean

- Assets mapping:

light:
  horizontal → /ivt/IVT_logo_black_horizontal@3x.png
  stacked    → /ivt/IVT_logo_black@3x.png
  icon       → /ivt/IVT_Icon@3x.png

dark:
  horizontal → /ivt/IVT_logo_white_horizontal@3x.png
  stacked    → /ivt/IVT_logo_white@3x.png
  icon       → /ivt/IVT_Icon@3x.png

- Wrap image inside a Link to "/"
- Add padding container for safe area (p-2)
- Default:
    variant="light"
    lockup="horizontal"

-----------------------------------
STEP 2: Integrate into Header
-----------------------------------

Open components/layout/Header.tsx

Find current logo usage.
Replace ONLY the image/logo part with:

<BrandLogo
  variant="light"
  lockup="horizontal"
  className="h-10 w-auto"
/>

Do NOT modify menus or layout.

-----------------------------------
STEP 3: Integrate into Footer
-----------------------------------

Open components/layout/Footer.tsx

Replace logo usage with:

<BrandLogo
  variant="dark"
  lockup="horizontal"
  className="h-8 w-auto"
/>

-----------------------------------
STEP 4: Output
-----------------------------------

Show:
- Full BrandLogo.tsx file
- The exact diff inside Header.tsx
- The exact diff inside Footer.tsx

Do NOT proceed to other design changes.