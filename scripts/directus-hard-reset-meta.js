#!/usr/bin/env node

/**
 * Hard reset broken meta-only CMS collections
 * Removes broken collection metadata that has no physical database tables
 * Only targets collections defined in code snapshot (projects, events, news, testimonials)
 * Preserves Prisma tables (ProjectApplication, _prisma_migrations)
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
    // Handle 404 as "not found" (acceptable for delete operations)
    if (response.status === 404) {
      return { notFound: true };
    }
    const error = await response.text();
    const errorMsg = `API error (${response.status}) at ${url}: ${error}`;
    throw new Error(errorMsg);
  }

  // Handle 204 No Content (DELETE operations may return this)
  if (response.status === 204) {
    return { deleted: true };
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

function loadCodeSnapshotCollections() {
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

async function listCollections() {
  const response = await fetchAPI('/collections');
  const collections = response?.data || response || [];
  return collections.filter((col) => !col.collection.startsWith('directus_'));
}

async function deleteCollection(collectionName) {
  try {
    const result = await fetchAPI(`/collections/${collectionName}`, {
      method: 'DELETE',
    });
    
    if (result?.notFound) {
      return { deleted: false, reason: 'not_found' };
    }
    
    if (result?.deleted || result === null) {
      return { deleted: true };
    }
    
    return { deleted: true };
  } catch (error) {
    // If error is 404, that's fine - collection doesn't exist
    if (error.message.includes('404')) {
      return { deleted: false, reason: 'not_found' };
    }
    throw error;
  }
}

async function deleteFields(collectionName) {
  // Best-effort: try to get and delete fields using global endpoint
  try {
    const endpoint = `/fields?filter[collection][_eq]=${encodeURIComponent(collectionName)}`;
    const fieldsResponse = await fetchAPI(endpoint);
    const fields = fieldsResponse?.data || fieldsResponse || [];
    
    if (!Array.isArray(fields)) {
      return { deleted: 0, error: 'invalid_response' };
    }

    let deletedCount = 0;
    for (const field of fields) {
      if (field.field === 'id') {
        // Skip id field - it's managed by collection
        continue;
      }
      
      try {
        // Try DELETE /fields/{collection}/{field} format first
        try {
          await fetchAPI(`/fields/${collectionName}/${field.field}`, {
            method: 'DELETE',
          });
          deletedCount++;
        } catch (e) {
          // If that fails, try DELETE /fields/{id} if field has an id
          if (field.id) {
            try {
              await fetchAPI(`/fields/${field.id}`, {
                method: 'DELETE',
              });
              deletedCount++;
            } catch (e2) {
              // Ignore errors deleting individual fields
              console.warn(`    ⚠ Could not delete field ${field.field} (tried both formats): ${e.message}`);
            }
          } else {
            console.warn(`    ⚠ Could not delete field ${field.field}: ${e.message}`);
          }
        }
      } catch (error) {
        // Ignore errors deleting individual fields
        console.warn(`    ⚠ Could not delete field ${field.field}: ${error.message}`);
      }
    }
    
    return { deleted: deletedCount };
  } catch (error) {
    // If 403 or 404, that's okay - fields may not be accessible or don't exist
    if (error.message.includes('403') || error.message.includes('404')) {
      return { deleted: 0, error: 'not_accessible' };
    }
    // Re-throw other errors
    throw error;
  }
}

async function hardResetMeta() {
  console.log('Hard reset: Removing broken meta-only CMS collections...\n');

  const codeCollections = loadCodeSnapshotCollections();
  console.log(`Target collections from code snapshot: ${[...codeCollections].join(', ')}\n`);

  const existingCollections = await listCollections();
  const collectionsToReset = existingCollections.filter((col) =>
    codeCollections.has(col.collection) &&
    col.collection !== 'ProjectApplication' && // Preserve Prisma tables
    col.collection !== '_prisma_migrations'
  );

  if (collectionsToReset.length === 0) {
    console.log('✓ No CMS collections to reset - all clean or missing');
    return;
  }

  console.log(`Found ${collectionsToReset.length} CMS collection(s) to reset:\n`);
  collectionsToReset.forEach((col) => {
    console.log(`  - ${col.collection}`);
  });
  console.log('');

  const results = [];

  for (const collection of collectionsToReset) {
    const collectionName = collection.collection;
    console.log(`Processing: ${collectionName}`);

    try {
      // Step 1: Delete fields (best-effort)
      console.log(`  Deleting field metadata...`);
      const fieldsResult = await deleteFields(collectionName);
      if (fieldsResult.deleted > 0) {
        console.log(`    ✓ Deleted ${fieldsResult.deleted} field(s)`);
      } else if (fieldsResult.error === 'not_accessible') {
        console.log(`    ⚠ Fields not accessible (403/404) - may already be clean`);
      }

      // Step 2: Delete collection
      console.log(`  Deleting collection metadata...`);
      const deleteResult = await deleteCollection(collectionName);
      if (deleteResult.deleted) {
        console.log(`    ✓ Collection deleted`);
        results.push({ collection: collectionName, status: 'deleted' });
      } else if (deleteResult.reason === 'not_found') {
        console.log(`    ⚠ Collection not found (404) - may already be deleted`);
        results.push({ collection: collectionName, status: 'not_found' });
      } else {
        results.push({ collection: collectionName, status: 'unknown', result: deleteResult });
      }
    } catch (error) {
      console.error(`  ✗ Error processing ${collectionName}: ${error.message}`);
      results.push({ collection: collectionName, status: 'error', error: error.message });
    }

    console.log('');
  }

  // Step 3: Verify collections are gone
  console.log('Verifying collections are removed...\n');
  const remainingCollections = await listCollections();
  const stillPresent = remainingCollections
    .filter((col) => codeCollections.has(col.collection))
    .map((col) => col.collection);

  if (stillPresent.length > 0) {
    console.error(`✗ Warning: Some collections are still present: ${stillPresent.join(', ')}`);
    console.error('  You may need to manually clean these in Directus UI or database');
  } else {
    console.log('✓ All target collections removed from metadata');
  }

  console.log('\n✓ Hard reset complete');
  console.log(`  Processed: ${results.length} collection(s)`);
  console.log(`  Deleted: ${results.filter((r) => r.status === 'deleted').length}`);
  console.log(`  Not found: ${results.filter((r) => r.status === 'not_found').length}`);
  console.log(`  Errors: ${results.filter((r) => r.status === 'error').length}`);
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
    await hardResetMeta();
  } catch (error) {
    console.error('Error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
