We have a Next.js App Router + TS project that runs fine, but terminal shows:
- npm deprecated warnings (transitive)
- 9 vulnerabilities (1 low, 5 moderate, 2 high, 1 critical)
- Browserslist caniuse-lite outdated warning
- Next.js warning: metadata.metadataBase is not set (defaults to http://localhost:3000)

Goal:
Create a safe baseline cleanup WITHOUT breaking dependencies and WITHOUT forcing major upgrades.

Tasks:
1) Security audit (safe path):
   - Run `npm audit` and summarize the top-level causes.
   - Apply `npm audit fix` (WITHOUT --force).
   - If vulnerabilities remain that require --force or major version bumps, do NOT apply them. Instead, document them in SECURITY_NOTES.md with:
     - package
     - severity
     - suggested fix
     - why we are not forcing it yet
   - Ensure `npm install` and `npm run dev` still work after changes.

2) Update browserslist db:
   - Run `npx update-browserslist-db@latest` (or equivalent recommended command)
   - Commit the resulting lockfile changes if any.

3) Fix metadataBase warning:
   - Add a proper `metadataBase` setting in app/layout.tsx (or a central metadata helper).
   - Use env var NEXT_PUBLIC_SITE_URL if available; fallback to http://localhost:3000.
   - Example: metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000")
   - Ensure this does not break SSR.

4) Add documentation:
   - Create SECURITY_NOTES.md with the vulnerability status after safe fixes.
   - Update .env.example to include NEXT_PUBLIC_SITE_URL (if missing).
   - Keep changes minimal.

Constraints:
- Do not introduce ESLint/Prettier yet (that comes next).
- Do not change UI/UX.
- Do not upgrade Next.js major versions unless required by safe audit fix (avoid).
- Do not use `npm audit fix --force`.

Deliverable:
- A clean and safe baseline:
  - browserslist warning gone
  - metadataBase warning gone
  - vulnerabilities reduced as much as possible without force
  - SECURITY_NOTES.md documenting remaining issues
- Provide a short summary of exactly what changed.
