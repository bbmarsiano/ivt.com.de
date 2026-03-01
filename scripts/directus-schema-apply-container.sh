#!/bin/bash

# Apply Directus schema snapshot using Directus CLI inside container
# Generates snapshot from code schema, applies it via CLI, and verifies

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
CONTAINER_NAME="ivt_directus"

# Load environment variables from .env if it exists
if [ -f "${PROJECT_ROOT}/.env" ]; then
  export $(cat "${PROJECT_ROOT}/.env" | grep -v '^#' | xargs)
fi

# Load environment variables from .env.directus if it exists
if [ -f "${PROJECT_ROOT}/.env.directus" ]; then
  export $(cat "${PROJECT_ROOT}/.env.directus" | grep -v '^#' | xargs)
fi

DIRECTUS_URL="${DIRECTUS_URL:-http://localhost:8055}"

echo "Applying Directus schema via CLI inside container..."
echo "  Container: ${CONTAINER_NAME}"
echo "  URL: ${DIRECTUS_URL}"
echo ""

# Check if container is running
if ! docker ps --filter "name=${CONTAINER_NAME}" --format "{{.Names}}" | grep -q "${CONTAINER_NAME}"; then
  echo "Error: Container '${CONTAINER_NAME}' is not running"
  echo "Start it with: docker compose -f docker/docker-compose.directus.yml up -d"
  exit 1
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
  echo "Error: Node.js is not installed"
  echo "Install Node.js to run the snapshot generation script"
  exit 1
fi

# Step 1: Generate canonical snapshot from Directus
echo "Step 1: Generating canonical snapshot from Directus..."
CONTAINER_CANONICAL="/directus/snapshots/canonical.yaml"
HOST_CANONICAL="${PROJECT_ROOT}/directus/snapshots/canonical.yaml"

# Ensure directory exists in container
docker exec "${CONTAINER_NAME}" mkdir -p /directus/snapshots

# Generate canonical snapshot inside container
echo "  Running: npx directus schema snapshot ${CONTAINER_CANONICAL}"
docker exec -i "${CONTAINER_NAME}" sh -c "npx directus schema snapshot ${CONTAINER_CANONICAL}"

if [ $? -ne 0 ]; then
  echo ""
  echo "✗ Failed to generate canonical snapshot"
  exit 1
fi

# Copy canonical snapshot to host
docker cp "${CONTAINER_NAME}:${CONTAINER_CANONICAL}" "${HOST_CANONICAL}"

if [ ! -f "${HOST_CANONICAL}" ]; then
  echo "Error: Canonical snapshot not copied to host: ${HOST_CANONICAL}"
  exit 1
fi

echo "✓ Canonical snapshot saved to: ${HOST_CANONICAL}"
echo ""

# Step 2: Generate merged snapshot from code schema
echo "Step 2: Generating merged snapshot from canonical + code schema..."
cd "${PROJECT_ROOT}"

# Check if js-yaml is installed
if ! npm list js-yaml &> /dev/null; then
  echo "Installing js-yaml package..."
  npm install js-yaml --save-dev
fi

node scripts/generate-directus-snapshot-from-code.js

SNAPSHOT_FILE="directus/snapshots/ivt-directus.snapshot.yaml"
if [ ! -f "${PROJECT_ROOT}/${SNAPSHOT_FILE}" ]; then
  echo "Error: Merged snapshot file not generated: ${SNAPSHOT_FILE}"
  exit 1
fi

echo ""

# Step 3: Copy merged snapshot to container
echo "Step 3: Copying merged snapshot to container..."
CONTAINER_SNAPSHOT_PATH="/directus/snapshots/ivt-directus.snapshot.yaml"

# Ensure directory exists in container
docker exec "${CONTAINER_NAME}" mkdir -p /directus/snapshots

# Copy snapshot file to container
docker cp "${PROJECT_ROOT}/${SNAPSHOT_FILE}" "${CONTAINER_NAME}:${CONTAINER_SNAPSHOT_PATH}"

echo "✓ Snapshot copied to container: ${CONTAINER_SNAPSHOT_PATH}"
echo ""

# Step 4: Apply schema using Directus CLI
echo "Step 4: Applying schema via Directus CLI..."
echo "  Running: npx directus schema apply ${CONTAINER_SNAPSHOT_PATH} --yes"
echo ""

# Directus CLI needs to run from the Directus installation directory
# The container's working directory should be /directus
docker exec -i "${CONTAINER_NAME}" sh -c "npx directus schema apply ${CONTAINER_SNAPSHOT_PATH} --yes"

if [ $? -ne 0 ]; then
  echo ""
  echo "✗ Schema apply failed"
  exit 1
fi

echo ""
echo "✓ Schema applied successfully"
echo ""

# Step 5: Verify by creating a snapshot of current state
echo "Step 5: Verifying schema (creating snapshot of current state)..."
AFTER_APPLY_SNAPSHOT="/directus/snapshots/after-apply.yaml"

docker exec -i "${CONTAINER_NAME}" sh -c "npx directus schema snapshot ${AFTER_APPLY_SNAPSHOT}"

if [ $? -eq 0 ]; then
  # Copy verification snapshot back to host
  HOST_AFTER_APPLY="${PROJECT_ROOT}/directus/snapshots/after-apply.yaml"
  docker cp "${CONTAINER_NAME}:${AFTER_APPLY_SNAPSHOT}" "${HOST_AFTER_APPLY}"
  echo "✓ Verification snapshot saved to: ${HOST_AFTER_APPLY}"
else
  echo "⚠ Could not create verification snapshot (non-critical)"
fi

echo ""
echo "✓ Schema apply complete!"
echo ""
echo "Next steps:"
echo "  1. Verify in Directus UI: http://localhost:8055"
echo "     - Check Settings > Data Model"
echo "     - Verify collections: projects, events, news, testimonials"
echo "     - Check that fields are visible (no 403 errors)"
echo ""
echo "  2. Verify in database:"
echo "     psql -d ivt_dev -c \"\\dt\""
echo "     # Should show: projects, events, news, testimonials"
echo ""
echo "  3. Verify via API:"
echo "     curl -s -H \"Authorization: Bearer \$DIRECTUS_TOKEN\" \\"
echo "       \"${DIRECTUS_URL}/fields?filter[collection][_eq]=projects\" | jq '.data | length'"
echo "     # Should return > 0"
