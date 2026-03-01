#!/bin/bash

# Apply Directus schema snapshot
# Runs the Node.js script to create collections and fields

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Load environment variables from .env if it exists
if [ -f "${PROJECT_ROOT}/.env" ]; then
  export $(cat "${PROJECT_ROOT}/.env" | grep -v '^#' | xargs)
fi

DIRECTUS_URL="${DIRECTUS_URL:-http://localhost:8055}"
DIRECTUS_TOKEN="${DIRECTUS_TOKEN}"
DIRECTUS_ADMIN_EMAIL="${DIRECTUS_ADMIN_EMAIL:-${ADMIN_EMAIL}}"
DIRECTUS_ADMIN_PASSWORD="${DIRECTUS_ADMIN_PASSWORD:-${ADMIN_PASSWORD}}"

# Check authentication: either token or email/password
if [ -z "${DIRECTUS_TOKEN}" ] && ([ -z "${DIRECTUS_ADMIN_EMAIL}" ] || [ -z "${DIRECTUS_ADMIN_PASSWORD}" ]); then
  echo "Error: Either DIRECTUS_TOKEN or DIRECTUS_ADMIN_EMAIL/DIRECTUS_ADMIN_PASSWORD must be set"
  echo ""
  echo "Option 1: Use static admin token (recommended):"
  echo "  DIRECTUS_TOKEN=your-static-token"
  echo ""
  echo "Option 2: Use email/password:"
  echo "  DIRECTUS_ADMIN_EMAIL=admin@example.com"
  echo "  DIRECTUS_ADMIN_PASSWORD=your-password"
  echo ""
  echo "Set them in your .env file or export them"
  exit 1
fi

# Print authentication method
if [ -n "${DIRECTUS_TOKEN}" ]; then
  echo "🔑 Using static admin token for authentication"
else
  echo "🔑 Using email/password authentication"
fi
echo ""

# Check if reset mode is enabled
DIRECTUS_RESET="${DIRECTUS_RESET:-0}"

if [ "${DIRECTUS_RESET}" = "1" ]; then
  echo "🔄 Reset mode enabled - will reset CMS collections before applying schema"
  echo ""
fi

echo "Applying Directus schema..."
echo "  URL: ${DIRECTUS_URL}"
if [ -n "${DIRECTUS_TOKEN}" ]; then
  echo "  Auth: Static admin token"
else
  echo "  Auth: Email/password (${DIRECTUS_ADMIN_EMAIL})"
fi
echo ""

# Check if Node.js is available
if ! command -v node &> /dev/null; then
  echo "Error: Node.js is not installed"
  echo "Install Node.js to run the schema application script"
  exit 1
fi

# Check if @directus/sdk is installed
if [ ! -d "${PROJECT_ROOT}/node_modules/@directus/sdk" ]; then
  echo "Installing @directus/sdk..."
  cd "${PROJECT_ROOT}"
  npm install @directus/sdk dotenv
fi

# Run reset script if enabled
if [ "${DIRECTUS_RESET}" = "1" ]; then
  echo "Step 1: Hard reset - removing broken meta-only collections..."
  cd "${PROJECT_ROOT}"
  node scripts/directus-hard-reset-meta.js
  echo ""
  echo "Step 2: Applying code-based schema..."
fi

# Run the schema application script (from code snapshot)
cd "${PROJECT_ROOT}"
node scripts/directus-apply-schema-from-code.js

# Print reminder if reset was used
if [ "${DIRECTUS_RESET}" = "1" ]; then
  echo ""
  echo "✓ Reset and apply completed!"
  echo ""
  echo "Next steps:"
  echo "  1. Export current schema:"
  echo "     node scripts/directus-export-current-schema.js"
  echo ""
  echo "  2. Verify schema matches code:"
  echo "     node scripts/directus-diff-schema.js"
  echo ""
  echo "  (Should show 0 differences)"
fi
