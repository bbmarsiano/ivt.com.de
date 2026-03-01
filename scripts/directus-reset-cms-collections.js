#!/usr/bin/env node

/**
 * Reset CMS collections in Directus
 * Deletes only collections that are in the code snapshot (safe to reset)
 * Never deletes Prisma tables or system collections
 */

const fs = require('fs');
const path = require('path');

// Load environment variables (dotenv is optional)
try {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
  // Also try .env.directus if it exists
  require('dotenv').config({ path: path.join(__dirname, '..', '.env.directus') });
} catch (e) {
  // dotenv not installed, rely on environment variables from shell
}

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN;
const DIRECTUS_ADMIN_EMAIL = process.env.DIRECTUS_ADMIN_EMAIL || process.env.ADMIN_EMAIL;
const DIRECTUS_ADMIN_PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;

// Use static token if available, otherwise require email/password
if (!DIRECTUS_TOKEN && (!DIRECTUS_ADMIN_EMAIL || !DIRECTUS_ADMIN_PASSWORD)) {
  console.error('Error: Either DIRECTUS_TOKEN or DIRECTUS_ADMIN_EMAIL/DIRECTUS_ADMIN_PASSWORD must be set');
  process.exit(1);
}

let accessToken = DIRECTUS_TOKEN || null;

async function fetchAPI(endpoint, options = {}) {
  const url = `${DIRECTUS_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error (${response.status}): ${error}`);
  }

  // Handle 204 No Content (DELETE operations may return this)
  if (response.status === 204) {
    return null;
  }

  // Try to parse JSON, but handle empty responses
  const text = await response.text();
  if (!text || text.trim() === '') {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    // If JSON parsing fails but status is OK, return null (for empty responses)
    return null;
  }
}

async function authenticate() {
  if (DIRECTUS_TOKEN) {
    // Use static token - no login needed
    accessToken = DIRECTUS_TOKEN;
    return accessToken;
  } else {
    // Fallback to email/password login
    const response = await fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: DIRECTUS_ADMIN_EMAIL,
        password: DIRECTUS_ADMIN_PASSWORD,
      }),
    });

    accessToken = response.data.access_token;
    return accessToken;
  }
}

async function listCollections() {
  const response = await fetchAPI('/collections');
  return response.data.filter((col) => !col.collection.startsWith('directus_'));
}

async function deleteCollection(collection) {
  return fetchAPI(`/collections/${collection}`, {
    method: 'DELETE',
  });
}

function loadCodeSnapshot() {
  const snapshotPath = path.join(
    __dirname,
    '..',
    'directus',
    'snapshots',
    'ivt-schema.from-code.json'
  );

  if (!fs.existsSync(snapshotPath)) {
    throw new Error(`Code snapshot not found: ${snapshotPath}`);
  }

  const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
  return new Set(snapshot.collections.map((col) => col.collection));
}

async function resetCollections() {
  console.log('Resetting CMS collections...\n');

  // Load code snapshot to get list of collections we manage
  const codeCollections = loadCodeSnapshot();
  console.log(`Code snapshot defines ${codeCollections.size} collections: ${[...codeCollections].join(', ')}\n`);

  // Get current collections
  const currentCollections = await listCollections();
  console.log(`Found ${currentCollections.length} collections in Directus:`);
  currentCollections.forEach((col) => {
    console.log(`  - ${col.collection}`);
  });
  console.log('');

  // Collections to delete: only those in code snapshot
  const collectionsToDelete = currentCollections.filter((col) =>
    codeCollections.has(col.collection)
  );

  // Collections to preserve: Prisma tables and others not in snapshot
  const collectionsToPreserve = currentCollections.filter(
    (col) => !codeCollections.has(col.collection)
  );

  if (collectionsToPreserve.length > 0) {
    console.log('Preserving collections (not in code snapshot):');
    collectionsToPreserve.forEach((col) => {
      console.log(`  ✓ ${col.collection}`);
    });
    console.log('');
  }

  if (collectionsToDelete.length === 0) {
    console.log('✓ No collections to reset - all code collections are already clean or missing');
    return;
  }

  console.log(`Collections to reset (${collectionsToDelete.length}):`);
  collectionsToDelete.forEach((col) => {
    console.log(`  - ${col.collection}`);
  });
  console.log('');

  // Confirm deletion
  console.log('⚠️  WARNING: This will delete the above collections and all their data!');
  console.log('   Only collections in the code snapshot will be deleted.');
  console.log('   Prisma tables (ProjectApplication, _prisma_migrations) will be preserved.\n');

  // Delete collections
  const deleted = [];
  const errors = [];

  for (const collection of collectionsToDelete) {
    try {
      await deleteCollection(collection.collection);
      deleted.push(collection.collection);
      console.log(`✓ Deleted collection: ${collection.collection}`);
    } catch (error) {
      errors.push({ collection: collection.collection, error: error.message });
      console.error(`✗ Failed to delete ${collection.collection}: ${error.message}`);
    }
  }

  console.log('');
  if (deleted.length > 0) {
    console.log(`✓ Successfully deleted ${deleted.length} collection(s): ${deleted.join(', ')}`);
  }
  if (errors.length > 0) {
    console.error(`✗ Failed to delete ${errors.length} collection(s)`);
    process.exit(1);
  }
}

async function main() {
  try {
    console.log(`Connecting to Directus at ${DIRECTUS_URL}...`);
    if (DIRECTUS_TOKEN) {
      console.log('Using static admin token for authentication');
    } else {
      console.log('Using email/password authentication');
    }
    await authenticate();
    console.log('✓ Authenticated successfully\n');
    await resetCollections();
  } catch (error) {
    console.error('Error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
