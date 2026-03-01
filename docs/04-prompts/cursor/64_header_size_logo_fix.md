Open components/layout/Header.tsx

We will align logo height with header height.

-----------------------------------
STEP 1: Ensure header container has fixed height
-----------------------------------

Find the main header wrapper (the top-level <header> or nav container).

Add:

className="h-20 md:h-24"

(Keep existing classes, just append these.)

-----------------------------------
STEP 2: Update BrandLogo usage
-----------------------------------

Replace className on BrandLogo with:

className="h-full w-auto"

-----------------------------------
STEP 3:
Ensure the immediate parent container of BrandLogo has:

className="flex items-center h-full"

Do not change menu logic.
Do not modify layout structure.
Only adjust sizing and alignment.

Return only modified snippets.