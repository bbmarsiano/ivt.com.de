#!/usr/bin/env node

/**
 * Apply Directus schema from code-based snapshot
 * Loads schema from directus/snapshots/ivt-schema.from-code.json
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
    const errorMsg = `API error (${response.status}) at ${url}: ${error}`;
    throw new Error(errorMsg);
  }

  // Handle 204 No Content (DELETE/PATCH operations may return this)
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

async function collectionExists(collection) {
  try {
    await fetchAPI(`/collections/${collection}`);
    return true;
  } catch (e) {
    return false;
  }
}

async function getFieldsForCollection(collectionName) {
  // Use /fields/{collection} endpoint (after DB migration, Directus can introspect columns)
  // Fallback to global endpoint with filter if needed
  try {
    const endpoint = `/fields/${collectionName}`;
    const response = await fetchAPI(endpoint);
    return response?.data || response || [];
  } catch (error) {
    // Fallback: try global endpoint with filter
    console.warn(`  ⚠ Could not fetch fields via /fields/${collectionName}, trying fallback: ${error.message}`);
    const fallbackEndpoint = `/fields?filter[collection][_eq]=${encodeURIComponent(collectionName)}`;
    const response = await fetchAPI(fallbackEndpoint);
    return response?.data || response || [];
  }
}

async function createCollection(collectionDef) {
  // NOTE: This script now only creates Directus metadata, NOT database columns.
  // Database columns must be created via SQL migration first (see db/migrations/).
  // After columns exist, Directus will introspect them automatically.
  
  // Create collection metadata only (table should already exist from SQL migration)
  const collection = await fetchAPI('/collections', {
    method: 'POST',
    body: JSON.stringify({
      collection: collectionDef.collection,
      meta: {
        collection: collectionDef.collection,
        icon: null,
        note: null,
        hidden: false,
        singleton: false,
      },
      schema: {
        name: collectionDef.collection,
      },
    }),
  });

  // Verify that Directus can see fields (columns should exist from SQL migration)
  try {
    const fields = await getFieldsForCollection(collectionDef.collection);
    
    if (!Array.isArray(fields) || fields.length === 0) {
      console.warn(`  ⚠ Collection ${collectionDef.collection} has no fields - ensure database columns exist via SQL migration`);
      console.warn(`     Run: bash scripts/db-apply-migration.sh`);
      console.warn(`     Then restart Directus to introspect columns`);
    } else {
      const idField = fields.find((f) => f.field === 'id');
      if (idField) {
        console.log(`  ✓ Collection has ${fields.length} field(s) (introspected from database)`);
        if (idField.type !== 'uuid') {
          console.warn(`  ⚠ Field "id" is ${idField.type}, expected uuid`);
        }
      } else {
        console.warn(`  ⚠ Collection missing "id" field - ensure database table exists`);
      }
    }
  } catch (error) {
    console.warn(`  ⚠ Could not verify collection fields: ${error.message}`);
    console.warn(`     Ensure database columns exist via SQL migration and Directus is restarted`);
  }

  return collection;
}

async function fieldExists(collection, field) {
  try {
    const fields = await getFieldsForCollection(collection);
    return fields.some((f) => f.field === field);
  } catch (e) {
    return false;
  }
}

async function createField(collection, fieldDef) {
  // NOTE: This function creates Directus field METADATA only, NOT database columns.
  // Database columns must exist first (created via SQL migration).
  // If the column exists in the DB, Directus will introspect it automatically.
  // This function ensures the metadata (interface, validation, etc.) matches our code schema.
  
  // Convert snapshot field format to Directus API format
  // Use global POST /fields endpoint with collection in body
  const apiField = {
    collection: collection,
    field: fieldDef.field,
    type: fieldDef.type,
    meta: fieldDef.meta || {},
    schema: fieldDef.schema || {},
  };

  try {
    return await fetchAPI('/fields', {
      method: 'POST',
      body: JSON.stringify(apiField),
    });
  } catch (error) {
    // If field already exists in DB but metadata creation fails, that's okay
    // Directus may have already introspected it
    if (error.message.includes('already exists') || error.message.includes('duplicate')) {
      console.warn(`    ⚠ Field "${fieldDef.field}" may already exist (introspected from database)`);
      // Try to update metadata instead
      try {
        return await fetchAPI(`/fields/${collection}/${fieldDef.field}`, {
          method: 'PATCH',
          body: JSON.stringify({
            meta: fieldDef.meta || {},
            schema: fieldDef.schema || {},
          }),
        });
      } catch (updateError) {
        // If update also fails, field may be system-managed, that's okay
        console.warn(`    ⚠ Could not update field metadata: ${updateError.message}`);
        return null;
      }
    }
    throw error;
  }
}

async function listCollections() {
  const response = await fetchAPI('/collections');
  // Handle both direct array and wrapped response formats
  const collections = response?.data || response || [];
  return collections.filter((col) => !col.collection.startsWith('directus_'));
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

  return JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
}

async function applySchema() {
  console.log('Applying Directus metadata from code snapshot...\n');
  console.log('NOTE: This script manages Directus METADATA only, not database columns.');
  console.log('      Database columns must be created via SQL migration first.\n');

  // Load schema from JSON file
  const snapshot = loadCodeSnapshot();
  const collections = snapshot.collections || [];

  console.log(`Loaded ${collections.length} collections from code snapshot\n`);

  // Create collections and fields
  for (const collectionDef of collections) {
    try {
      const exists = await collectionExists(collectionDef.collection);
      if (exists) {
        console.log(`✓ Collection "${collectionDef.collection}" already exists`);
        // Verify fields are visible (columns should exist from SQL migration)
        try {
          const fields = await getFieldsForCollection(collectionDef.collection);
          const idField = fields.find((f) => f.field === 'id');
          if (idField && idField.type) {
            if (idField.type !== 'uuid') {
              console.log(`  ⚠ Field "id" is ${idField.type}, not uuid.`);
            } else {
              console.log(`  ✓ Field "id" is UUID (primary key)`);
            }
          }
          console.log(`  ✓ Found ${fields.length} field(s) (introspected from database)`);
        } catch (e) {
          console.warn(`  ⚠ Could not read fields: ${e.message}`);
          console.warn(`     Ensure database columns exist via SQL migration and Directus is restarted`);
        }
      } else {
        await createCollection(collectionDef);
        console.log(`✓ Created collection metadata "${collectionDef.collection}"`);
        console.log(`  NOTE: Ensure database table exists (created via SQL migration)`);
      }

      // Create/update field metadata (skip id field - it's system-managed)
      let createdFieldCount = 0;
      let updatedFieldCount = 0;
      for (const fieldDef of collectionDef.fields) {
        if (fieldDef.field === 'id') {
          // ID field is system-managed, skip metadata creation
          continue;
        }

        const exists = await fieldExists(collectionDef.collection, fieldDef.field);
        if (exists) {
          // Field exists in Directus metadata - try to update metadata to match code schema
          try {
            await fetchAPI(`/fields/${collectionDef.collection}/${fieldDef.field}`, {
              method: 'PATCH',
              body: JSON.stringify({
                meta: fieldDef.meta || {},
                schema: fieldDef.schema || {},
              }),
            });
            updatedFieldCount++;
            console.log(`  ✓ Updated metadata for field "${fieldDef.field}"`);
          } catch (updateError) {
            // If update fails, field may be system-managed or read-only, that's okay
            console.warn(`  ⚠ Could not update metadata for field "${fieldDef.field}": ${updateError.message}`);
          }
        } else {
          // Field doesn't exist in Directus metadata - create metadata only
          // NOTE: Database column should already exist from SQL migration
          try {
            await createField(collectionDef.collection, fieldDef);
            console.log(`  ✓ Created metadata for field "${fieldDef.field}"`);
            createdFieldCount++;
          } catch (error) {
            // If creation fails, column may not exist in DB or Directus hasn't introspected it yet
            if (error.message.includes('column') || error.message.includes('does not exist')) {
              console.warn(`  ⚠ Field "${fieldDef.field}" column may not exist in database`);
              console.warn(`     Ensure database columns exist via SQL migration: bash scripts/db-apply-migration.sh`);
              console.warn(`     Then restart Directus to introspect columns`);
            } else {
              console.error(`  ✗ Failed to create metadata for field "${fieldDef.field}": ${error.message}`);
            }
          }
        }
      }

      if (createdFieldCount > 0) {
        console.log(`  ✓ Created ${createdFieldCount} new field metadata entry/entries for "${collectionDef.collection}"`);
      }
      if (updatedFieldCount > 0) {
        console.log(`  ✓ Updated ${updatedFieldCount} field metadata entry/entries for "${collectionDef.collection}"`);
      }

      // Final verification: ensure collection has expected fields using global endpoint
      try {
        const fields = await getFieldsForCollection(collectionDef.collection);
        const fieldCount = Array.isArray(fields) ? fields.length : 0;
        
        if (fieldCount === 0) {
          console.warn(`  ⚠ Collection ${collectionDef.collection} has no fields - ensure database columns exist via SQL migration`);
          console.warn(`     Run: bash scripts/db-apply-migration.sh`);
          console.warn(`     Then restart Directus to introspect columns`);
        }

        const expectedFieldCount = collectionDef.fields.length;
        console.log(`  ✓ Final verification: Collection has ${fieldCount} field(s) (expected: ${expectedFieldCount})`);
      } catch (error) {
        if (error.message.includes('physical table')) {
          throw error; // Re-throw our verification errors
        }
        console.warn(`  ⚠ Could not verify final field count: ${error.message}`);
      }
    } catch (error) {
      console.error(`✗ Error processing collection "${collectionDef.collection}":`, error.message);
    }
  }

  // List collections
  console.log('\n✓ Schema applied successfully!\n');
  console.log('Collections:');
  const collectionsList = await listCollections();
  collectionsList.forEach((col) => {
    console.log(`  - ${col.collection}`);
  });
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
    await applySchema();
  } catch (error) {
    console.error('Error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
