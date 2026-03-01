#!/bin/bash

# Fix Directus permissions for CMS collections
# Ensures the current user's role has proper permissions for projects, events, news, testimonials

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Load environment variables from .env if it exists
if [ -f "${PROJECT_ROOT}/.env" ]; then
  export $(cat "${PROJECT_ROOT}/.env" | grep -v '^#' | xargs)
fi

# Load environment variables from .env.directus if it exists
if [ -f "${PROJECT_ROOT}/.env.directus" ]; then
  export $(cat "${PROJECT_ROOT}/.env.directus" | grep -v '^#' | xargs)
fi

DIRECTUS_URL="${DIRECTUS_URL:-http://localhost:8055}"
DIRECTUS_TOKEN="${DIRECTUS_TOKEN}"

if [ -z "${DIRECTUS_TOKEN}" ]; then
  echo "Error: DIRECTUS_TOKEN must be set"
  echo ""
  echo "Set it in .env.directus or export it:"
  echo "  export DIRECTUS_TOKEN=your-token-here"
  echo ""
  echo "Or add to .env.directus:"
  echo "  DIRECTUS_TOKEN=your-token-here"
  exit 1
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
  echo "Error: Node.js is not installed"
  echo "Install Node.js to run the permissions fix script"
  exit 1
fi

echo "Fixing Directus permissions..."
echo "  URL: ${DIRECTUS_URL}"
echo "  Token: ${DIRECTUS_TOKEN:0:10}... (hidden)"
echo ""

# Run the permissions fix script
cd "${PROJECT_ROOT}"
node scripts/directus-fix-permissions.js

echo ""
echo "✓ Permissions fix complete!"
echo ""
echo "Next steps:"
echo "  1. Verify in Directus UI:"
echo "     - Open http://localhost:8055"
echo "     - Navigate to Content → Projects/Events/News/Testimonials"
echo "     - Should open without FORBIDDEN errors"
echo ""
echo "  2. Verify via API:"
echo "     curl -s -H \"Authorization: Bearer \$DIRECTUS_TOKEN\" \\"
echo "       \"${DIRECTUS_URL}/items/projects?limit=1\" | jq"
echo "     # Should return data (not FORBIDDEN)"
