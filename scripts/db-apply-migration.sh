#!/bin/bash

# Apply SQL migration to database
# Safely applies migration files from db/migrations/ to the database specified in DATABASE_URL

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Load environment variables from .env.local or .env
if [ -f "${PROJECT_ROOT}/.env.local" ]; then
  export $(cat "${PROJECT_ROOT}/.env.local" | grep -v '^#' | xargs)
elif [ -f "${PROJECT_ROOT}/.env" ]; then
  export $(cat "${PROJECT_ROOT}/.env" | grep -v '^#' | xargs)
fi

# Check if DATABASE_URL is set
if [ -z "${DATABASE_URL}" ]; then
  echo "Error: DATABASE_URL is not set"
  echo ""
  echo "Set it in .env.local or .env:"
  echo "  DATABASE_URL=postgresql://user:password@localhost:5432/ivt_dev"
  exit 1
fi

# Migration file to apply
MIGRATION_FILE="${PROJECT_ROOT}/db/migrations/2026-01-22_cms_tables.sql"

# Check if migration file exists
if [ ! -f "${MIGRATION_FILE}" ]; then
  echo "Error: Migration file not found: ${MIGRATION_FILE}"
  exit 1
fi

echo "Applying database migration..."
echo "  Database: ${DATABASE_URL%%@*}"
echo "  Migration: $(basename ${MIGRATION_FILE})"
echo ""
echo "This will add columns to:"
echo "  - public.projects"
echo "  - public.events"
echo "  - public.news"
echo "  - public.testimonials"
echo ""
echo "Press Ctrl+C to cancel, or Enter to continue..."
read -r

# Check if psql is available
if ! command -v psql &> /dev/null; then
  echo "Error: psql is not installed"
  echo "Install PostgreSQL client tools to run migrations"
  exit 1
fi

# Apply migration
echo "Applying migration..."
psql "${DATABASE_URL}" -f "${MIGRATION_FILE}"

if [ $? -eq 0 ]; then
  echo ""
  echo "✓ Migration applied successfully!"
  echo ""
  echo "Next steps:"
  echo "  1. Restart Directus: docker-compose -f docker/docker-compose.directus.yml restart"
  echo "  2. Verify fields: curl -s -H \"Authorization: Bearer \$DIRECTUS_TOKEN\" \\"
  echo "     http://localhost:8055/fields/projects | jq '.data | length'"
  echo "  3. Fix permissions if needed: ./scripts/directus-fix-permissions.sh"
else
  echo ""
  echo "✗ Migration failed"
  exit 1
fi
