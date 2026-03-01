Create a deterministic Directus schema setup using Directus schema snapshots, so we do NOT configure collections manually.

We already run Directus via docker-compose service "ivt_directus" on http://localhost:8055 connected to local Postgres ivt_dev.

Goals:
- Provide a versioned schema snapshot in the repo.
- Provide scripts to apply the schema snapshot to Directus.
- Align field names with our existing Next.js content models (mock/service layer):
  projects, events, news, partners, testimonials, team, resources.
- Use explicit DE/EN fields: *_de, *_en.
- Include relations to directus_files for images/documents where needed.

Tasks:
1) Add folder structure:
- directus/
  - snapshots/
  - README.md
- scripts/
  - directus-apply-schema.sh
  - directus-status.sh

2) Create a Directus schema snapshot file:
- directus/snapshots/ivt-schema.snapshot.json
It must define these collections and fields:

A) projects
- id (uuid primary, existing)
- slug (string, unique, required)
- status (string, required; allowed: ongoing, completed)
- industry (string, required; allowed: technology, manufacturing, green_energy, defense)
- featured (boolean, default false)
- title_de (string, required)
- title_en (string, required)
- summary_de (text, required)
- summary_en (text, required)
- description_de (text or rich text, required)
- description_en (text or rich text, required)
- coordinator_name (string, required)
- coordinator_title (string, required)
- coordinator_email (string/email, required)
- coordinator_phone (string, optional)
- who_can_participate_de (json, optional)
- who_can_participate_en (json, optional)
- tags (json, optional)
- metrics (json, optional)
- images (m2m to directus_files, optional)
- documents (m2m to directus_files, optional)
- published_at (datetime, optional)
- created_at, updated_at (system)

B) events
- id
- title_de, title_en (string required)
- location_de, location_en (string required)
- description_de, description_en (text required)
- start_at (datetime required)
- end_at (datetime optional)
- registration_url (string/url optional)
- cover_image (m2o to directus_files optional)
- published_at (datetime optional)

C) news
- id
- slug (unique required)
- title_de, title_en (string required)
- summary_de, summary_en (text required)
- content_de, content_en (text required)
- cover_image (m2o to directus_files optional)
- published_at (datetime required)

D) partners
- id
- name (string required)
- location_de, location_en (string required)
- expertise_de, expertise_en (text required)
- role_de, role_en (text required)
- website (string/url optional)
- logo (m2o to directus_files optional)
- published_at (datetime optional)

E) testimonials
- id
- quote_de, quote_en (text required)
- author_name (string required)
- author_title_de, author_title_en (string optional)
- company_name (string required)
- company_logo (m2o to directus_files optional)
- featured (boolean default false)

F) team
- id
- name (string required)
- role_de, role_en (string required)
- bio_de, bio_en (text optional)
- photo (m2o to directus_files optional)
- order (integer default 1)

G) resources
- id
- title_de, title_en (string required)
- description_de, description_en (text optional)
- type (string required; allowed: pdf, template, guideline, video, link)
- file (m2o to directus_files optional)
- url (string/url optional)
- published_at (datetime optional)

3) Scripts:
- scripts/directus-status.sh should:
  - check if docker container ivt_directus is running
  - curl http://localhost:8055/server/info
- scripts/directus-apply-schema.sh should:
  - require env vars:
    DIRECTUS_URL (default http://localhost:8055)
    DIRECTUS_ADMIN_EMAIL
    DIRECTUS_ADMIN_PASSWORD
  - login via Directus API to obtain an access token
  - apply schema snapshot using Directus schema endpoints OR CLI inside container
  - print success + what collections exist after apply

Prefer an API-based apply if CLI is not easily available.
If using API:
- Use /auth/login to get access_token
- Use schema apply endpoints (documented) or import mechanism supported by Directus snapshots
If needed, create a Node script under scripts/ that uses @directus/sdk to apply the snapshot.

4) Docs:
- directus/README.md with:
  - how to run directus
  - how to apply schema
  - how to verify
  - troubleshooting

Constraints:
- Do not touch Prisma schema or Next.js UI code in this prompt.
- Keep secrets out of git. Add .env.directus.example if needed.
Deliverables:
- I can apply schema from a single command and get consistent collections/fields.
