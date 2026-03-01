#!/bin/bash

# Check Directus status
# Verifies if the Docker container is running and if Directus API is accessible

set -e

CONTAINER_NAME="ivt_directus"
DIRECTUS_URL="${DIRECTUS_URL:-http://localhost:8055}"

echo "Checking Directus status..."
echo ""

# Check if container is running
if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "✓ Docker container '${CONTAINER_NAME}' is running"
else
  echo "✗ Docker container '${CONTAINER_NAME}' is not running"
  echo ""
  echo "Start it with:"
  echo "  docker compose -f docker/docker-compose.directus.yml up -d"
  exit 1
fi

# Check if Directus API is accessible
echo ""
echo "Checking Directus API at ${DIRECTUS_URL}..."

if curl -s -f "${DIRECTUS_URL}/server/info" > /dev/null 2>&1; then
  echo "✓ Directus API is accessible"
  
  # Get version info
  VERSION=$(curl -s "${DIRECTUS_URL}/server/info" | grep -o '"version":"[^"]*"' | cut -d'"' -f4 || echo "unknown")
  echo "  Version: ${VERSION}"
else
  echo "✗ Directus API is not accessible at ${DIRECTUS_URL}"
  echo ""
  echo "Check logs with:"
  echo "  docker compose -f docker/docker-compose.directus.yml logs"
  exit 1
fi

echo ""
echo "✓ Directus is running and accessible"
