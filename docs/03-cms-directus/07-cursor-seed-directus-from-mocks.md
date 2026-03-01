You are working inside the ivt.com.de Next.js project.

Goal: Seed Directus CMS with the existing mock content (projects, events, news, testimonials) so we can manage content in Directus UI. This step MUST NOT change any frontend behavior yet (site should still use mock data). We only add scripts + docs + small env handling.

Context:
- Directus is running locally at http://localhost:8055
- There is a root file .env.directus containing:
  DIRECTUS_URL=http://localhost:8055
  DIRECTUS_TOKEN=... (static admin token)
- Existing mock data lives in:
  lib/mock/projects.ts
  lib/mock/events.ts
  lib/mock/news.ts
  lib/mock/testimonials.ts
- Directus collections already exist with correct fields.

Requirements:
1) Add a seeding script that reads the mock data and upserts it into Directus.
   - Create: scripts/directus-seed-from-mocks.ts (TypeScript) or .js if simpler.
   - It must load DIRECTUS_URL and DIRECTUS_TOKEN from .env.directus (preferably via dotenv with explicit path).
   - Use Directus REST API with Authorization: Bearer token.
   - For each collection:
     - Upsert logic:
       * projects: unique by slug
       * events: unique by slug
       * news: unique by slug
       * testimonials: unique by a stable synthetic key (e.g. company_name + author_name), or add a new field "seed_key" if needed; prefer not to change schema. If schema has no slug, use a deterministic "seed_key" but store it in an existing field only if one exists; otherwise upsert by matching (company_name, author_name, quote_de).
     - If item exists -> PATCH it, else -> POST create it.
   - Mapping must be 1:1 with our DB schema fields (the ones in migration):
     projects:
       slug, status, industry, title_de, title_en, summary_de, summary_en, description_de, description_en,
       thumbnail (string), images (json array), tags (json array), featured (boolean), coordinator (json),
       metrics (json nullable), eligibility_de (json array), eligibility_en (json array), documents (json array),
       createdAt (date)
     events:
       slug, title_de, title_en, description_de, description_en, location, start_at, end_at, cover (string)
     news:
       slug, title_de, title_en, summary_de, summary_en, published_at, cover (string), tags (json array)
     testimonials:
       quote_de, quote_en, author_name, author_title_de, author_title_en, company_name, company_logo (string), featured (boolean)
   - Ensure dates are valid ISO strings for Directus (e.g. new Date(...).toISOString()).
   - Print a clear summary at the end:
     “projects: X created, Y updated”
     same for other collections.

2) Add an npm script:
   - package.json: "directus:seed" -> runs the script
   - If TS script, add ts-node or use node with transpile via tsx (choose simplest; avoid complex setup).
   - Prefer: use "tsx" (lightweight) if already present; otherwise add it.

3) Add documentation:
   - Create docs/03-cms-directus/02-seed-content.md
   - Include steps:
     - Ensure Directus is running
     - Ensure .env.directus exists
     - Run: npm run directus:seed
     - Verify in Directus UI (Content -> each collection shows items)

4) Safety:
   - DO NOT commit secrets. .env.directus should remain gitignored (do not change gitignore now unless missing).
   - Do not modify existing runtime behavior of the website.
   - Do not modify Prisma/email/application flow.

After implementing:
- Provide commands to run the seed.
- Ensure TypeScript/lint still pass.

Return a short summary of files changed and how to run.
