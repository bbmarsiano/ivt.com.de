#!/usr/bin/env node

/**
 * Export current Directus schema to snapshot file
 * Exports the current schema from Directus and saves it to directus/snapshots/current.directus.json
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

  return response.json();
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

async function exportSchema() {
  console.log('Exporting current Directus schema using REST system endpoints...\n');

  // Step 1: Get all collections (REST endpoint - schema level, no item querying)
  console.log('Fetching collections...');
  const collectionsResponse = await fetchAPI('/collections');
  const allCollections = collectionsResponse.data || [];
  
  // Filter out directus_* system collections but keep all user collections (including Prisma tables)
  const userCollections = allCollections.filter(
    (col) => !col.collection.startsWith('directus_')
  );

  console.log(`Found ${userCollections.length} user collections (excluding directus_* system collections)`);

  // Step 2: Get all fields at once (REST endpoint - schema level)
  console.log('Fetching all fields...');
  let allFields = [];
  try {
    const fieldsResponse = await fetchAPI('/fields');
    allFields = fieldsResponse.data || [];
  } catch (error) {
    console.warn(`  ⚠ Could not fetch all fields at once, will fetch per collection: ${error.message}`);
  }

  // Step 3: Get all relations at once (REST endpoint - schema level)
  console.log('Fetching all relations...');
  let allRelations = [];
  try {
    const relationsResponse = await fetchAPI('/relations');
    allRelations = relationsResponse.data || [];
  } catch (error) {
    console.warn(`  ⚠ Could not fetch all relations at once: ${error.message}`);
  }

  const schema = {
    version: 1,
    exported_at: new Date().toISOString(),
    collections: [],
  };

  // Step 4: Build schema by combining collections, fields, and relations
  for (const collection of userCollections) {
    console.log(`  Processing collection: ${collection.collection}`);

    try {
      // Get fields for this collection using /fields/{collection} endpoint
      // After DB migration, Directus can introspect columns and this endpoint works
      let fields = [];
      try {
        const endpoint = `/fields/${collection.collection}`;
        const fieldsResponse = await fetchAPI(endpoint);
        fields = fieldsResponse?.data || fieldsResponse || [];
        if (!Array.isArray(fields)) {
          fields = [];
        }
      } catch (error) {
        // Fallback: try global endpoint with filter if /fields/{collection} fails
        console.warn(`    ⚠ Could not fetch fields via /fields/${collection.collection}, trying fallback: ${error.message}`);
        if (allFields.length > 0) {
          fields = allFields.filter((f) => f.collection === collection.collection);
        } else {
          try {
            const fallbackEndpoint = `/fields?filter[collection][_eq]=${encodeURIComponent(collection.collection)}`;
            const fieldsResponse = await fetchAPI(fallbackEndpoint);
            fields = fieldsResponse?.data || fieldsResponse || [];
            if (!Array.isArray(fields)) {
              fields = [];
            }
          } catch (fallbackError) {
            console.warn(`    ⚠ Could not fetch fields for ${collection.collection}: ${fallbackError.message}`);
            fields = [];
          }
        }
      }

      // Get relations for this collection
      let relations = [];
      if (allRelations.length > 0) {
        // Use pre-fetched relations
        relations = allRelations.filter(
          (r) => r.collection === collection.collection || r.related_collection === collection.collection
        );
      } else {
        // Fallback: try per-collection endpoint (may not exist)
        try {
          const relationsResponse = await fetchAPI(`/relations/${collection.collection}`);
          relations = relationsResponse.data || [];
        } catch (e) {
          // Endpoint may not exist, that's okay
          relations = [];
        }
      }

      schema.collections.push({
        collection: collection.collection,
        meta: collection.meta || {},
        schema: collection.schema || {},
        fields: fields.map((field) => ({
          field: field.field,
          type: field.type,
          meta: field.meta || {},
          schema: field.schema || {},
        })),
        relations: relations.map((rel) => ({
          collection: rel.collection,
          field: rel.field,
          related_collection: rel.related_collection,
          meta: rel.meta || {},
          schema: rel.schema || {},
        })),
      });

      console.log(`    ✓ ${fields.length} fields, ${relations.length} relations`);
    } catch (error) {
      console.error(`  ✗ Error processing collection ${collection.collection}:`, error.message);
      // Still add collection with empty fields/relations
      schema.collections.push({
        collection: collection.collection,
        meta: collection.meta || {},
        schema: collection.schema || {},
        fields: [],
        relations: [],
      });
    }
  }

  // Save to file
  const outputPath = path.join(__dirname, '..', 'directus', 'snapshots', 'current.directus.json');
  fs.writeFileSync(outputPath, JSON.stringify(schema, null, 2));

  console.log(`\n✓ Schema exported to: ${outputPath}`);
  console.log(`  Collections: ${schema.collections.length}`);
  console.log(`  Total fields: ${schema.collections.reduce((sum, col) => sum + col.fields.length, 0)}`);
  console.log(`  Total relations: ${schema.collections.reduce((sum, col) => sum + col.relations.length, 0)}`);
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
    await exportSchema();
  } catch (error) {
    console.error('Error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
