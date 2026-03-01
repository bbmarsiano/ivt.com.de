We have a running Next.js App Router + TypeScript project (no backend/CMS yet). Baseline security/metadata has been done.

Goal: production hardening and standardization WITHOUT changing UI behavior and WITHOUT adding backend/CMS.

Tasks:
1) ESLint + Prettier:
   - Add ESLint config aligned with Next.js + TypeScript.
   - Add Prettier config.
   - Add scripts:
     - "lint": "next lint"
     - "typecheck": "tsc --noEmit"
     - "format": "prettier --write ."
     - "format:check": "prettier --check ."
   - Ensure `npm run lint` works and does not introduce noisy/unfixable rules.

2) TypeScript strictness + shared model types:
   - Enable `strict: true` in tsconfig (and other sane strict options).
   - Create types in `lib/types/content.ts`:
     - Locale = 'de' | 'en'
     - Project (matching lib/mock/projects structure)
     - Testimonial
     - NewsPost
     - EventItem
   - Ensure mock data files conform to these types (no implicit any).
   - Ensure services/contentService.ts is fully typed and returns typed objects.

3) Path aliases:
   - Configure `tsconfig.json` paths:
     @/* -> ./
     @/app/*, @/components/*, @/lib/*, @/services/*, @/styles/*
   - Update imports across the codebase to use aliases (avoid deep ../../../).

4) Env helper:
   - Add `lib/env.ts` that reads:
     NEXT_PUBLIC_SITE_URL (fallback http://localhost:3000)
     NEXT_PUBLIC_DEFAULT_LOCALE (fallback 'de')
     NEXT_PUBLIC_SUPPORTED_LOCALES (fallback 'de,en')
   - Provide typed accessors and parsing helpers.
   - Ensure no runtime crash if env vars are missing.
   - Keep DIRECTUS_URL, DIRECTUS_TOKEN, RESEND_API_KEY placeholders unused for now.

Constraints:
- Do NOT change UI/UX behavior.
- Do NOT add backend, database, Directus, or email sending yet.
- Keep intro overlay and all pages working.
- Keep changes minimal but clean.

Deliverable:
- `npm run dev` works.
- `npm run lint` works.
- `npm run typecheck` passes.
- Imports use aliases.
- Content service + mocks are fully typed.
Also provide a short summary of changed files.
