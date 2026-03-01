# Seeding Directus with Mock Content

This guide explains how to seed Directus CMS with existing mock data from `lib/mock/*`.

## Overview

The seeding script reads mock data from:
- `lib/mock/projects.ts`
- `lib/mock/events.ts`
- `lib/mock/news.ts`
- `lib/mock/testimonials.ts`

And upserts it into Directus collections using the REST API.

## Prerequisites

1. **Directus is running**:
   ```bash
   docker-compose -f docker/docker-compose.directus.yml up -d
   ```

2. **`.env.directus` exists** with:
   ```env
   DIRECTUS_URL=http://localhost:8055
   DIRECTUS_TOKEN=your-static-admin-token-here
   ```

3. **Database columns exist** (from SQL migration):
   ```bash
   bash scripts/db-apply-migration.sh
   ```

4. **Directus has introspected columns** (after restart):
   ```bash
   docker-compose -f docker/docker-compose.directus.yml restart
   ```

5. **Permissions are set** (if needed):
   ```bash
   ./scripts/directus-fix-permissions.sh
   ```

## Running the Seed

### Install Dependencies

First, install `tsx` (TypeScript executor) if not already installed:

```bash
npm install
```

### Run Seed Script

```bash
npm run directus:seed
```

This will:
- Load mock data from `lib/mock/*`
- Map fields to Directus schema
- Upsert items into Directus collections:
  - **projects**: Upsert by `slug` (unique)
  - **events**: Upsert by `slug` (unique)
  - **news**: Upsert by `slug` (unique)
  - **testimonials**: Upsert by matching `company_name` + `author_name` + `quote_de` prefix

### Expected Output

```
🌱 Seeding Directus CMS with mock data...

Directus URL: http://localhost:8055
Token: abc123... (hidden)

📦 Seeding projects...
  ✓ Created: ai-research-hub
  ✓ Created: sustainable-mobility
  ...

📅 Seeding events...
  ✓ Created: startup-pitch-night-februar
  ...

📰 Seeding news...
  ✓ Created: neue-foerderprogramme-2024
  ...

💬 Seeding testimonials...
  ✓ Created: TechVision AI - Dr. Michael Schneider
  ...

✅ Seeding complete!

Summary:
  projects: 6 created, 0 updated
  events: 5 created, 0 updated
  news: 5 created, 0 updated
  testimonials: 4 created, 0 updated

💡 Verify in Directus UI: http://localhost:8055 → Content
```

## Verification

### In Directus UI

1. Open http://localhost:8055
2. Navigate to **Content** → **Projects** (or Events, News, Testimonials)
3. Verify items are visible and editable

### Via API

```bash
# Check projects count
curl -s -H "Authorization: Bearer $DIRECTUS_TOKEN" \
  "http://localhost:8055/items/projects?limit=1" | jq '.data | length'

# Check a specific project
curl -s -H "Authorization: Bearer $DIRECTUS_TOKEN" \
  "http://localhost:8055/items/projects?filter[slug][_eq]=ai-research-hub" | jq '.data[0]'
```

## Field Mapping

The script maps mock data fields to Directus schema:

### Projects
- `coordinator` (object) → JSON string
- `images`, `tags`, `eligibility_de`, `eligibility_en`, `documents` (arrays) → JSON strings
- `metrics` (object, nullable) → JSON string or null
- `createdAt` (date string) → ISO timestamp

### Events
- `start_at`, `end_at` → ISO timestamps (already in correct format)

### News
- `tags` (array) → JSON string
- `published_at` → ISO timestamp (already in correct format)

### Testimonials
- No special mapping needed (all fields are simple types)

## Upsert Logic

- **Projects/Events/News**: Uses `slug` as unique identifier
  - If item with same `slug` exists → **UPDATE** (PATCH)
  - If not → **CREATE** (POST)

- **Testimonials**: Uses composite key (`company_name` + `author_name` + `quote_de` prefix)
  - If matching item exists → **UPDATE** (PATCH)
  - If not → **CREATE** (POST)

## Re-running the Seed

The script is **idempotent** - you can run it multiple times safely:
- Existing items (matched by unique key) will be **updated**
- New items will be **created**
- No duplicates will be created

## Troubleshooting

### "DIRECTUS_TOKEN must be set"

**Error**: `Error: DIRECTUS_TOKEN must be set in .env.directus`

**Solution**:
1. Create `.env.directus` in project root
2. Add `DIRECTUS_TOKEN=your-token-here`
3. Get token from Directus UI: Settings → Access Tokens

### "API error (403)"

**Error**: `API error (403) at http://localhost:8055/items/projects`

**Solution**:
Run permissions fix:
```bash
./scripts/directus-fix-permissions.sh
```

### "API error (404) - Collection not found"

**Error**: Collection doesn't exist in Directus

**Solution**:
1. Ensure database columns exist: `bash scripts/db-apply-migration.sh`
2. Restart Directus: `docker-compose -f docker/docker-compose.directus.yml restart`
3. Wait 10-20 seconds for introspection

### "Field validation failed"

**Error**: Field type mismatch or required field missing

**Solution**:
1. Check that database columns match schema: `psql $DATABASE_URL -c "\d+ public.projects"`
2. Verify Directus has introspected columns: `curl -H "Authorization: Bearer $DIRECTUS_TOKEN" http://localhost:8055/fields/projects`
3. Check mock data structure matches expected schema

## Notes

- **No frontend changes**: This script only seeds Directus. The website still uses mock data from `lib/mock/*` until we switch to Directus API.
- **Safe to re-run**: The script is idempotent and won't create duplicates.
- **Secrets**: `.env.directus` is gitignored - never commit tokens.

## Related Documentation

- `docs/03-cms-directus/02-schema.md` - Database schema and migrations
- `directus/README.md` - Directus setup and management
- `docs/03-cms-directus/01-local-setup.md` - Directus local setup
