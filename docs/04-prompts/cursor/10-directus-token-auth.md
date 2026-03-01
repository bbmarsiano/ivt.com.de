Update Directus scripts to support authentication via DIRECTUS_TOKEN (static admin token) to avoid 403 permission issues.

Problem:
directus-export-current-schema.js fails with 403 FORBIDDEN on CMS collections using email/password login.

Tasks:
1) In scripts/directus-export-current-schema.js, scripts/directus-apply-schema.js, scripts/directus-reset-cms-collections.js:
   - If env DIRECTUS_TOKEN is present, use it as Bearer token and skip /auth/login.
   - Otherwise fallback to existing email/password login.

2) Update scripts/directus-apply-schema.sh:
   - If DIRECTUS_TOKEN is set, do not require DIRECTUS_ADMIN_EMAIL/PASSWORD.
   - Print which auth method is used.

3) Update directus/README.md:
   - Recommend Static Admin Token for scripts
   - How to create token (Settings → Tokens)
   - Store in .env.directus (gitignored)

Extra hardening (important):
- Ensure export script uses REST endpoints (/collections, /fields) and not GraphQL, to avoid "Queried in root" permission issues.

Deliverable:
- With DIRECTUS_TOKEN set, export/apply/reset scripts work with no 403 and can see CMS collections.
