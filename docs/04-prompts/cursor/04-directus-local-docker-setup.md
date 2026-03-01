Add local Directus (open-source) via Docker Compose and connect it to our existing local Postgres database (ivt_dev).

Goals:
- Directus runs locally at http://localhost:8055
- Use the existing Postgres database: ivt_dev (same as Prisma uses)
- Keep Next.js app unchanged (no integration yet)
- Store docker config inside /docker

Tasks:
1) Create docker compose:
- Create docker/docker-compose.directus.yml
- Services:
  - directus (official directus/directus image)
- Configure Directus to use the existing local Postgres on host:
  - DB_CLIENT=pg
  - DB_HOST=host.docker.internal
  - DB_PORT=5432
  - DB_DATABASE=ivt_dev
  - DB_USER=dimitarmitrev
  - (DB_PASSWORD empty if local auth works; if needed, support DB_PASSWORD env)
- Expose port 8055:8055
- Add basic env:
  DIRECTUS_KEY (random)
  DIRECTUS_SECRET (random)
  ADMIN_EMAIL (placeholder)
  ADMIN_PASSWORD (placeholder strong)
  CORS enabled for localhost:3000

2) Environment files:
- Create docker/directus.env.example with the needed env vars.
- Do NOT commit real secrets. Ensure docker/directus.env is gitignored.
- Update .gitignore accordingly.
- Update .env.example with placeholders for Directus:
  DIRECTUS_URL=http://localhost:8055
  DIRECTUS_TOKEN= (later)
  (Already present, keep consistent.)

3) Docs:
- Add docs/03-cms-directus/01-local-setup.md describing:
  - how to start/stop Directus
  - default URL
  - where to set admin email/password
  - troubleshooting notes (especially host.docker.internal on Mac)

Constraints:
- Do NOT modify Prisma schema.
- Do NOT create Directus collections yet.
- Keep changes minimal and organized.

Deliverable:
- I can run Directus locally with:
  docker compose -f docker/docker-compose.directus.yml --env-file docker/directus.env up -d
- And access it at http://localhost:8055
