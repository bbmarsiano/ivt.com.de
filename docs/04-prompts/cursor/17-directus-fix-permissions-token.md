We have Directus running with Postgres tables created for: projects, events, news, testimonials.
But Directus UI shows FORBIDDEN: "You don't have permission to access collection ... Queried in root."
We already have a static admin token in .env.directus:
DIRECTUS_URL + DIRECTUS_TOKEN.

Goal:
- Fix Directus permissions so our token/user can access the 4 CMS collections in both Content and Data Model.
- Use DIRECTUS_TOKEN only (do not rely on ADMIN_EMAIL/ADMIN_PASSWORD).
- Make it idempotent and safe (only touch permissions for these 4 collections).

Tasks:
1) Create script: scripts/directus-fix-permissions.js
- Loads DIRECTUS_URL and DIRECTUS_TOKEN from .env.directus (and fallback to process.env).
- Calls GET /users/me to get current user's role id.
- For each collection in [projects, events, news, testimonials]:
  - Ensure permissions exist for the user's role for actions:
    read, create, update, delete
  - Minimal permissive rules:
    fields: ["*"]
    permissions: {}
    validation: {}
    presets: {}
  - If a permission already exists for (role, collection, action), update it to the above.
  - Otherwise create it.
- Log created/updated counts.

Directus API endpoints to use:
- GET /users/me
- GET /permissions?filter[role][_eq]=...&filter[collection][_eq]=...&limit=200
- POST /permissions
- PATCH /permissions/{id}

2) Create shell wrapper: scripts/directus-fix-permissions.sh
- Loads .env.directus if present
- Runs node scripts/directus-fix-permissions.js

3) Update directus/README.md with:
- How to run permissions fix
- Verification commands (curl /items/projects?limit=1)

Acceptance:
- After running ./scripts/directus-fix-permissions.sh
  - curl with DIRECTUS_TOKEN to /items/projects works (not FORBIDDEN)
  - Directus UI Content opens these collections without error.
