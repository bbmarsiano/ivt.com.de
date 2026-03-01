Fix Directus docker-compose env loading. Current logs show:
"The ADMIN_EMAIL variable is not set... DIRECTUS_KEY ... defaulting to blank"
even when running with --env-file docker/directus.env.

Goal:
Make env loading deterministic by adding env_file directly into docker/docker-compose.directus.yml,
so the Directus container always receives ADMIN_EMAIL/ADMIN_PASSWORD/DIRECTUS_KEY/DIRECTUS_SECRET.

Tasks:
1) Update docker/docker-compose.directus.yml:
   - Remove the obsolete top-level `version:` key (compose v2 ignores it).
   - Under the directus service, add:
     env_file:
       - ./directus.env
     (the env file lives in docker/directus.env, and the compose file is in docker/, so use ./directus.env)
   - Ensure environment variables that are literal values remain, but variables should now resolve reliably.

2) Update docs (docs/03-cms-directus/01-local-setup.md):
   - Change the start command to:
     docker-compose -f docker/docker-compose.directus.yml up -d
   - Explain that docker/directus.env must exist and is loaded via env_file.

3) Ensure docker/directus.env is gitignored (already) and directus.env.example remains.

Deliverable:
- Running `docker-compose -f docker/docker-compose.directus.yml up -d` loads admin credentials correctly.
- Logs no longer warn about missing ADMIN_* and DIRECTUS_* vars.
