# Directus Schema Management

This document explains how we manage the Directus schema for CMS collections (projects, events, news, testimonials).

## Schema Strategy: Database-First with Directus Introspection

We use a **database-first approach** where:

1. **Database columns are created via SQL migrations** - This ensures exact control over column types, constraints, and indexes
2. **Directus introspects existing columns** - After restarting Directus, it automatically discovers columns in the database and creates field metadata
3. **Directus scripts manage metadata only** - Our scripts ensure Directus field metadata (interfaces, validation, etc.) matches our code schema, but do not create database columns

### Why Database-First?

- **Precise control**: SQL migrations give us exact control over PostgreSQL types, constraints, and indexes
- **Directus introspection**: Directus v11 automatically discovers existing database columns and creates field metadata
- **Separation of concerns**: Database structure (SQL) vs. Directus metadata (API) are managed separately
- **Version control**: SQL migrations are versioned and can be reviewed/applied independently
- **Performance**: We can add indexes and constraints directly in SQL without relying on Directus API

## Workflow

### 1. Create Database Columns (SQL Migration)

When adding or modifying CMS table columns:

```bash
# Apply the migration
bash scripts/db-apply-migration.sh
```

This applies `db/migrations/2026-01-22_cms_tables.sql` which:
- Adds all columns to `projects`, `events`, `news`, `testimonials` tables
- Creates unique indexes on slug fields
- Creates indexes on frequently queried fields (status, industry, featured, etc.)
- Uses PostgreSQL-native types (text, varchar, boolean, timestamptz, jsonb)

### 2. Restart Directus

After applying the migration, restart Directus so it can introspect the new columns:

```bash
docker-compose -f docker/docker-compose.directus.yml restart
```

Directus will automatically:
- Discover new columns in the database
- Create field metadata in `directus_fields` table
- Make fields available in the Directus UI

### 3. Verify Fields

Check that Directus can see the new columns:

```bash
curl -s -H "Authorization: Bearer $DIRECTUS_TOKEN" \
  http://localhost:8055/fields/projects | jq '.data | length'
```

Should return a number greater than 1 (at minimum: `id` + your new columns).

### 4. Fix Permissions (if needed)

If you get FORBIDDEN errors when accessing collections:

```bash
./scripts/directus-fix-permissions.sh
```

This ensures your token has permissions to access the CMS collections.

## Migration Files

Migrations are stored in `db/migrations/`:

- `2026-01-22_cms_tables.sql` - Initial CMS table columns

### Creating New Migrations

When you need to add/modify columns:

1. Create a new SQL file: `db/migrations/YYYY-MM-DD_description.sql`
2. Use `ALTER TABLE` with `ADD COLUMN IF NOT EXISTS` for safety
3. Add indexes for frequently queried fields
4. Test the migration on a local database first
5. Apply with `bash scripts/db-apply-migration.sh`

## Directus Metadata Management

After database columns exist, our Directus scripts manage metadata only:

- **`scripts/directus-export-current-schema.js`** - Exports current Directus field metadata
- **`scripts/directus-apply-schema-from-code.js`** - Ensures Directus metadata matches code schema (does NOT create DB columns)
- **`scripts/directus-diff-schema.js`** - Compares Directus metadata with code schema

These scripts:
- ✅ Update Directus field metadata (interfaces, validation, etc.)
- ✅ Create/update Directus collection metadata
- ❌ Do NOT create database columns (columns must exist first via SQL migration)

## Schema Files

- **`directus/snapshots/ivt-schema.from-code.json`** - Source of truth for code schema
- **`db/migrations/*.sql`** - Database column definitions
- **`directus/snapshots/current.directus.json`** - Exported Directus metadata (for comparison)

## Column Type Mapping

| Code Schema Type | PostgreSQL Type | Directus Type |
|-----------------|----------------|---------------|
| `uuid` | `uuid` | `uuid` |
| `string` (max_length: 255) | `VARCHAR(255)` | `string` |
| `string` (max_length: 500) | `VARCHAR(500)` | `string` |
| `text` | `TEXT` | `text` |
| `boolean` | `BOOLEAN` | `boolean` |
| `timestamp` | `TIMESTAMPTZ` | `timestamp` |
| `json` (data_type: jsonb) | `JSONB` | `json` |

## Indexes

We create indexes for:

- **Unique constraints**: `slug` fields (projects, events, news)
- **Query performance**: `status`, `industry`, `featured`, `published_at`, `start_at`

Indexes are created in SQL migrations, not via Directus API.

## Troubleshooting

### "Column already exists" errors

If you see errors about columns already existing:
- The migration uses `ADD COLUMN IF NOT EXISTS`, so it's safe to re-run
- Check if columns exist: `psql $DATABASE_URL -c "\d+ public.projects"`

### "Directus doesn't see new columns"

After adding columns:
1. Restart Directus: `docker-compose -f docker/docker-compose.directus.yml restart`
2. Wait 10-20 seconds for Directus to introspect
3. Check fields: `curl -H "Authorization: Bearer $DIRECTUS_TOKEN" http://localhost:8055/fields/projects`

### "FORBIDDEN when accessing collections"

Run the permissions fix:
```bash
./scripts/directus-fix-permissions.sh
```

## Related Documentation

- `directus/README.md` - Directus setup and schema management
- `docs/03-cms-directus/01-local-setup.md` - Directus local setup
- `directus/MODEL_CONTRACT.md` - Detailed field-by-field documentation
