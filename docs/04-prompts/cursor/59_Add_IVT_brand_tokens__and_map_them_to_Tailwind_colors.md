You are working in a Next.js App Router project with Tailwind (tailwind.config.ts) and global CSS at app/globals.css.

GOAL (Step A): Add IVT brand tokens (CSS variables) and map them to Tailwind colors in a SAFE, additive-only way.
IMPORTANT RULES:
- Do NOT remove or rename any existing variables, styles, or Tailwind config.
- Do NOT change existing color tokens used by shadcn/ui unless they do not exist.
- Only APPEND new blocks or EXTEND existing objects. No refactors.
- Keep changes minimal and reversible.
- After changes, provide exact verification commands and what “success” looks like.

TASK A1: Patch app/globals.css
1) Open app/globals.css.
2) If there is a :root block already, DO NOT modify its existing lines.
3) Append the following block at the END of the file (or if the file has a clear “custom tokens” section, append below it). This must be additive.

Add this exact CSS block:

/* =========================
   IVT Brand Tokens (additive)
   ========================= */
:root {
  --ivt-peach: #f9aa8f;
  --ivt-red: #ed1c24;
  --ivt-burgundy: #9a061a;

  --ivt-gray-500: #8f8f8f;
  --ivt-gray-600: #636363;
  --ivt-gray-700: #3d3d3d;

  /* map to app tokens */
  --color-primary: var(--ivt-red);
  --color-primary-dark: var(--ivt-burgundy);
  --color-accent: var(--ivt-peach);

  --color-text: #111111;
  --color-muted: var(--ivt-gray-600);
  --color-border: rgba(0, 0, 0, 0.10);
}

/* Optional dark surface tokens (used only if data-theme="dark" exists) */
[data-theme="dark"] {
  --color-text: #ffffff;
  --color-muted: rgba(255, 255, 255, 0.72);
  --color-border: rgba(255, 255, 255, 0.12);
}

Do not change anything else in globals.css.

TASK A2: Patch tailwind.config.ts
1) Open tailwind.config.ts.
2) Find theme.extend. If extend does not exist, create it inside theme (do not replace theme).
3) Under theme.extend, add/merge the following keys:
   - colors: add “ivt” palette and mapped tokens primary, primary-dark, accent, text, muted, border.
   - borderRadius: add ivt: "16px"
   - boxShadow: add ivt: "0 10px 30px rgba(0,0,0,0.08)"

IMPORTANT:
- If theme.extend.colors already exists, merge into it (do not overwrite existing colors).
- If there is already a “primary” key or similar, do NOT overwrite it. Instead, add new keys only if absent.
  - If “primary” already exists, add “ivtPrimary”, “ivtPrimaryDark”, “ivtAccent”, “ivtText”, “ivtMuted”, “ivtBorder” as fallbacks instead.
- Output the final modified snippets.

Use these preferred values:
ivt: {
  peach: "var(--ivt-peach)",
  red: "var(--ivt-red)",
  burgundy: "var(--ivt-burgundy)",
  gray: {
    500: "var(--ivt-gray-500)",
    600: "var(--ivt-gray-600)",
    700: "var(--ivt-gray-700)",
  },
}

Mapped tokens (only if not already present):
primary: "var(--color-primary)"
"primary-dark": "var(--color-primary-dark)"
accent: "var(--color-accent)"
text: "var(--color-text)"
muted: "var(--color-muted)"
border: "var(--color-border)"

Fallback names (use only if primary/accent/etc already exist and cannot be safely changed):
ivtPrimary, ivtPrimaryDark, ivtAccent, ivtText, ivtMuted, ivtBorder.

VALIDATION (must include in your response):
After applying patches, provide:
1) Command to restart dev server cleanly:
   rm -rf .next && npm run dev
2) Browser console checks:
   getComputedStyle(document.documentElement).getPropertyValue('--ivt-red')
   getComputedStyle(document.documentElement).getPropertyValue('--color-primary')
3) A quick Tailwind class smoke check suggestion (no code changes required):
   - Temporarily inspect any element in DevTools and add class "text-primary" (or "text-ivtPrimary" if fallback was used) and confirm computed color changes.

ROLLBACK:
Provide exact git commands:
- git diff (to review)
- git checkout -- app/globals.css tailwind.config.ts (to revert)

Finally:
- Summarize exactly what files you changed and what keys you added.
- Do NOT proceed to Step B.
