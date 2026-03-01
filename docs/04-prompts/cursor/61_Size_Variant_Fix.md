You are modifying logo sizing and variant usage only.

STRICT RULES:
- Do not change layout logic.
- Do not modify menus.
- Only adjust BrandLogo usage and remove redundant footer text.
- Keep everything stable.

-----------------------------------
STEP 1: Header logo size + variant
-----------------------------------

Open components/layout/Header.tsx

Replace BrandLogo usage with:

<BrandLogo
  variant="light"
  lockup="horizontal"
  className="h-8 md:h-9 w-auto"
  priority
/>

This ensures proper header scaling.

-----------------------------------
STEP 2: Footer logo variant + remove text
-----------------------------------

Open components/layout/Footer.tsx

1) Replace BrandLogo usage with:

<BrandLogo
  variant="light"
  lockup="horizontal"
  className="h-7 w-auto"
/>

2) Remove the plain text:
"Innovation Valley Thüringen"

Keep only the logo.

-----------------------------------
STEP 3: Do not modify anything else.
-----------------------------------

Return only the modified snippets.