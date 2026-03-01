#!/usr/bin/env node

/**
 * Generate Directus CLI snapshot YAML by merging canonical snapshot with code schema
 * 
 * Input A: directus/snapshots/canonical.yaml (Directus-native format)
 * Input B: directus/snapshots/ivt-schema.from-code.json (code schema)
 * Output: directus/snapshots/ivt-directus.snapshot.yaml (Directus-native format)
 * 
 * Merge rules:
 * - Only modify/add collections: projects, events, news, testimonials
 * - Remove stale entries for these collections before adding new ones
 * - Keep all other canonical snapshot parts untouched
 */

const fs = require('fs');
const path = require('path');

// Try to load js-yaml, fallback to manual parsing if not available
let yaml;
try {
  yaml = require('js-yaml');
} catch (e) {
  console.error('Error: js-yaml package not found. Install it with: npm install js-yaml');
  process.exit(1);
}

// CMS collections to manage (exclude Prisma tables)
const CMS_COLLECTIONS = new Set(['projects', 'events', 'news', 'testimonials']);

function loadCanonicalSnapshot() {
  const canonicalPath = path.join(
    __dirname,
    '..',
    'directus',
    'snapshots',
    'canonical.yaml'
  );

  if (!fs.existsSync(canonicalPath)) {
    throw new Error(`Canonical snapshot not found: ${canonicalPath}\nRun: ./scripts/directus-schema-apply-container.sh (it will generate canonical.yaml first)`);
  }

  const content = fs.readFileSync(canonicalPath, 'utf8');
  return yaml.load(content);
}

function loadCodeSchema() {
  const schemaPath = path.join(
    __dirname,
    '..',
    'directus',
    'snapshots',
    'ivt-schema.from-code.json'
  );

  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Code schema not found: ${schemaPath}`);
  }

  return JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
}

function convertCodeFieldToDirectusFormat(collectionName, field) {
  // Skip "id" field - Directus has built-in integer primary key
  if (field.field === 'id') {
    return null;
  }

  const directusField = {
    collection: collectionName,
    field: field.field,
    type: field.type,
  };

  // Schema properties
  if (field.schema) {
    directusField.schema = {};
    
    // Never set is_primary_key - Directus manages the primary key
    if (field.schema.is_unique !== undefined) {
      directusField.schema.is_unique = field.schema.is_unique;
    }
    if (field.schema.is_nullable !== undefined) {
      directusField.schema.is_nullable = field.schema.is_nullable;
    }
    if (field.schema.default_value !== undefined) {
      directusField.schema.default_value = field.schema.default_value;
    }
    if (field.schema.max_length !== undefined) {
      directusField.schema.max_length = field.schema.max_length;
    }
    if (field.schema.data_type !== undefined) {
      directusField.schema.data_type = field.schema.data_type;
    }
    if (field.schema.has_auto_increment !== undefined) {
      directusField.schema.has_auto_increment = field.schema.has_auto_increment;
    }
  }

  // Meta properties
  if (field.meta) {
    directusField.meta = {};
    
    if (field.meta.interface !== undefined) {
      directusField.meta.interface = field.meta.interface;
    }
    if (field.meta.required !== undefined) {
      directusField.meta.required = field.meta.required;
    }
    if (field.meta.readonly !== undefined) {
      directusField.meta.readonly = field.meta.readonly;
    }
    if (field.meta.hidden !== undefined) {
      directusField.meta.hidden = field.meta.hidden;
    }
    if (field.meta.width !== undefined) {
      directusField.meta.width = field.meta.width;
    }
    if (field.meta.special && field.meta.special.length > 0) {
      directusField.meta.special = field.meta.special;
    }
    if (field.meta.options) {
      directusField.meta.options = field.meta.options;
    }
  }

  return directusField;
}

function convertCodeCollectionToDirectusFormat(collection) {
  return {
    collection: collection.collection,
    meta: {
      accountability: 'all',
      archive_app_filter: true,
      archive_field: null,
      archive_value: null,
      collapse: 'open',
      collection: collection.collection,
      color: null,
      display_template: null,
      group: null,
      hidden: false,
      icon: null,
      item_duplication_fields: null,
      note: null,
      preview_url: null,
      singleton: false,
      sort: null,
      sort_field: null,
      translations: null,
      unarchive_value: null,
      versioning: false,
    },
    schema: {
      name: collection.collection,
    },
  };
}

function mergeSnapshots() {
  console.log('Merging canonical snapshot with code schema...\n');

  // Load inputs
  const canonical = loadCanonicalSnapshot();
  const codeSchema = loadCodeSchema();

  console.log(`Loaded canonical snapshot (version: ${canonical.version || 'unknown'})`);
  console.log(`Loaded code schema with ${codeSchema.collections?.length || 0} collections\n`);

  // Ensure canonical has required structure
  if (!canonical.collections) {
    canonical.collections = [];
  }
  if (!canonical.fields) {
    canonical.fields = [];
  }
  if (!canonical.relations) {
    canonical.relations = [];
  }

  // Filter code schema to only CMS collections
  const cmsCollections = (codeSchema.collections || []).filter((col) =>
    CMS_COLLECTIONS.has(col.collection)
  );

  console.log(`Processing ${cmsCollections.length} CMS collections: ${cmsCollections.map((c) => c.collection).join(', ')}\n`);

  // Step 1: Remove stale collections and fields for CMS collections
  console.log('Removing stale CMS collections and fields from canonical snapshot...');
  canonical.collections = canonical.collections.filter(
    (col) => !CMS_COLLECTIONS.has(col.collection)
  );
  canonical.fields = canonical.fields.filter(
    (field) => !CMS_COLLECTIONS.has(field.collection)
  );
  canonical.relations = canonical.relations.filter(
    (rel) => !CMS_COLLECTIONS.has(rel.collection) && !CMS_COLLECTIONS.has(rel.related_collection)
  );
  console.log('✓ Removed stale entries\n');

  // Step 2: Add collections from code schema
  console.log('Adding CMS collections from code schema...');
  for (const codeCollection of cmsCollections) {
    const directusCollection = convertCodeCollectionToDirectusFormat(codeCollection);
    canonical.collections.push(directusCollection);
    console.log(`  ✓ Added collection: ${codeCollection.collection}`);
  }
  console.log('');

  // Step 3: Add fields from code schema (skip "id", add "uuid")
  console.log('Adding CMS fields from code schema...');
  let fieldCount = 0;
  for (const codeCollection of cmsCollections) {
    // First, add uuid field (replaces id as public identifier)
    const uuidField = {
      collection: codeCollection.collection,
      field: 'uuid',
      type: 'uuid',
      schema: {
        is_unique: true,
        is_nullable: false,
        // PostgreSQL will generate UUIDs via default
        default_value: null, // Directus will handle DB default
      },
      meta: {
        interface: 'input',
        required: true,
        readonly: false,
        hidden: false,
        width: 'full',
        special: ['uuid'],
      },
    };
    canonical.fields.push(uuidField);
    fieldCount++;
    console.log(`  ✓ Added uuid field for ${codeCollection.collection}`);

    // Then add other fields (skip "id")
    for (const codeField of codeCollection.fields || []) {
      const directusField = convertCodeFieldToDirectusFormat(codeCollection.collection, codeField);
      
      // Skip if field was filtered out (e.g., "id")
      if (!directusField) {
        continue;
      }

      canonical.fields.push(directusField);
      fieldCount++;

      // Ensure slug is unique and required if present
      if (codeField.field === 'slug') {
        if (!directusField.schema) {
          directusField.schema = {};
        }
        directusField.schema.is_unique = true;
        directusField.schema.is_nullable = false;
        if (!directusField.meta) {
          directusField.meta = {};
        }
        directusField.meta.required = true;
      }
    }
    const otherFieldsCount = codeCollection.fields?.filter(f => f.field !== 'id').length || 0;
    console.log(`  ✓ Added ${otherFieldsCount} other fields for ${codeCollection.collection} (skipped "id" - Directus built-in)`);
  }
  console.log(`\nTotal fields added: ${fieldCount}\n`);

  return canonical;
}

function generateMergedSnapshot() {
  const merged = mergeSnapshots();

  // Write merged snapshot
  const outputPath = path.join(
    __dirname,
    '..',
    'directus',
    'snapshots',
    'ivt-directus.snapshot.yaml'
  );

  const yamlContent = yaml.dump(merged, {
    indent: 2,
    lineWidth: -1, // No line wrapping
    noRefs: true,
    sortKeys: false,
  });

  fs.writeFileSync(outputPath, yamlContent, 'utf8');

  console.log(`✓ Generated merged Directus snapshot: ${outputPath}`);
  console.log(`  Collections: ${merged.collections.length}`);
  console.log(`  Fields: ${merged.fields.length}`);
  console.log(`  Relations: ${merged.relations.length}`);
  console.log(`  System fields: ${merged.systemFields?.length || 0}`);
}

async function main() {
  try {
    generateMergedSnapshot();
  } catch (error) {
    console.error('Error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
