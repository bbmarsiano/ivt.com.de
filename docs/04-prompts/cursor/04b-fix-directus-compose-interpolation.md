Fix Docker Compose variable warnings by removing ${VAR} interpolation and relying on env_file injection.

Problem:
docker-compose warns DIRECTUS_KEY/SECRET/ADMIN_EMAIL/ADMIN_PASSWORD not set because ${VAR} interpolation happens before env_file is loaded.

Tasks:
1) In docker/docker-compose.directus.yml:
   - Keep: env_file: - ./directus.env
   - Remove environment entries that use ${DIRECTUS_KEY}, ${DIRECTUS_SECRET}, ${ADMIN_EMAIL}, ${ADMIN_PASSWORD}.
   - Ensure these variables are provided only via env_file, not interpolated.
   - Keep other static env settings (CORS etc.) as literal values.

2) Update docs to clarify:
   - secrets are provided via docker/directus.env (env_file)
   - no ${VAR} interpolation is required

Deliverable:
- Running `docker-compose -f docker/docker-compose.directus.yml up -d` produces NO warnings about missing DIRECTUS_* / ADMIN_*.
