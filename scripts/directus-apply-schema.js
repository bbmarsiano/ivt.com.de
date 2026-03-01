#!/usr/bin/env node

/**
 * Apply Directus schema snapshot
 * Creates all collections and fields defined in the schema
 */

const fs = require('fs');
const path = require('path');

// Load environment variables (dotenv is optional - shell script can export vars)
try {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
} catch (e) {
  // dotenv not installed, rely on environment variables from shell
}

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_ADMIN_EMAIL = process.env.DIRECTUS_ADMIN_EMAIL || process.env.ADMIN_EMAIL;
const DIRECTUS_ADMIN_PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;

if (!DIRECTUS_ADMIN_EMAIL || !DIRECTUS_ADMIN_PASSWORD) {
  console.error('Error: DIRECTUS_ADMIN_EMAIL and DIRECTUS_ADMIN_PASSWORD must be set');
  process.exit(1);
}

let accessToken = null;

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

  return response.json();
}

async function login() {
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

async function collectionExists(collection) {
  try {
    await fetchAPI(`/collections/${collection}`);
    return true;
  } catch (e) {
    return false;
  }
}

async function createCollection(collectionDef) {
  return fetchAPI('/collections', {
    method: 'POST',
    body: JSON.stringify(collectionDef),
  });
}

async function fieldExists(collection, field) {
  try {
    await fetchAPI(`/fields/${collection}/${field}`);
    return true;
  } catch (e) {
    return false;
  }
}

async function createField(collection, fieldDef) {
  return fetchAPI(`/fields/${collection}`, {
    method: 'POST',
    body: JSON.stringify(fieldDef),
  });
}

async function relationExists(collection, field) {
  try {
    await fetchAPI(`/relations/${collection}/${field}`);
    return true;
  } catch (e) {
    return false;
  }
}

async function createRelation(relationDef) {
  return fetchAPI('/relations', {
    method: 'POST',
    body: JSON.stringify(relationDef),
  });
}

async function listCollections() {
  const response = await fetchAPI('/collections');
  return response.data.filter((col) => !col.collection.startsWith('directus_'));
}

// Schema definitions
const collections = [
  {
    collection: 'projects',
    meta: {
      collection: 'projects',
      icon: null,
      note: 'Innovation Valley Thüringen projects',
      hidden: false,
      singleton: false,
    },
    schema: { name: 'projects' },
    fields: [
      { field: 'slug', type: 'string', meta: { interface: 'input', required: true, width: 'full' }, schema: { is_unique: true, max_length: 255, is_nullable: false } },
      { field: 'status', type: 'string', meta: { interface: 'select-dropdown', options: { choices: [{ text: 'Ongoing', value: 'ongoing' }, { text: 'Completed', value: 'completed' }] }, required: true, width: 'half' }, schema: { max_length: 255, is_nullable: false } },
      { field: 'industry', type: 'string', meta: { interface: 'select-dropdown', options: { choices: [{ text: 'Technology', value: 'technology' }, { text: 'Manufacturing', value: 'manufacturing' }, { text: 'Green Energy', value: 'green_energy' }, { text: 'Defense', value: 'defense' }] }, required: true, width: 'half' }, schema: { max_length: 255, is_nullable: false } },
      { field: 'featured', type: 'boolean', meta: { interface: 'boolean', width: 'half' }, schema: { default_value: false, is_nullable: true } },
      { field: 'title_de', type: 'string', meta: { interface: 'input', required: true, width: 'half' }, schema: { max_length: 255, is_nullable: false } },
      { field: 'title_en', type: 'string', meta: { interface: 'input', required: true, width: 'half' }, schema: { max_length: 255, is_nullable: false } },
      { field: 'summary_de', type: 'text', meta: { interface: 'input-multiline', required: true, width: 'full' }, schema: { is_nullable: false } },
      { field: 'summary_en', type: 'text', meta: { interface: 'input-multiline', required: true, width: 'full' }, schema: { is_nullable: false } },
      { field: 'description_de', type: 'text', meta: { interface: 'input-rich-text-html', required: true, width: 'full' }, schema: { is_nullable: false } },
      { field: 'description_en', type: 'text', meta: { interface: 'input-rich-text-html', required: true, width: 'full' }, schema: { is_nullable: false } },
      { field: 'coordinator_name', type: 'string', meta: { interface: 'input', required: true, width: 'half' }, schema: { max_length: 255, is_nullable: false } },
      { field: 'coordinator_title', type: 'string', meta: { interface: 'input', required: true, width: 'half' }, schema: { max_length: 255, is_nullable: false } },
      { field: 'coordinator_email', type: 'string', meta: { interface: 'input', required: true, width: 'half' }, schema: { max_length: 255, is_nullable: false } },
      { field: 'coordinator_phone', type: 'string', meta: { interface: 'input', width: 'half' }, schema: { max_length: 255, is_nullable: true } },
      { field: 'who_can_participate_de', type: 'json', meta: { interface: 'input-code', options: { language: 'json' }, special: ['json'], width: 'full' }, schema: { data_type: 'jsonb', is_nullable: true } },
      { field: 'who_can_participate_en', type: 'json', meta: { interface: 'input-code', options: { language: 'json' }, special: ['json'], width: 'full' }, schema: { data_type: 'jsonb', is_nullable: true } },
      { field: 'tags', type: 'json', meta: { interface: 'input-code', options: { language: 'json' }, special: ['json'], width: 'full' }, schema: { data_type: 'jsonb', is_nullable: true } },
      { field: 'metrics', type: 'json', meta: { interface: 'input-code', options: { language: 'json' }, special: ['json'], width: 'full' }, schema: { data_type: 'jsonb', is_nullable: true } },
      { field: 'published_at', type: 'timestamp', meta: { interface: 'datetime', special: ['date-time'], width: 'half' }, schema: { data_type: 'timestamp with time zone', is_nullable: true } },
    ],
  },
  {
    collection: 'events',
    meta: {
      collection: 'events',
      icon: null,
      note: 'Events',
      hidden: false,
      singleton: false,
    },
    schema: { name: 'events' },
    fields: [
      { field: 'title_de', type: 'string', meta: { interface: 'input', required: true, width: 'half' }, schema: { max_length: 255, is_nullable: false } },
      { field: 'title_en', type: 'string', meta: { interface: 'input', required: true, width: 'half' }, schema: { max_length: 255, is_nullable: false } },
      { field: 'location_de', type: 'string', meta: { interface: 'input', required: true, width: 'half' }, schema: { max_length: 255, is_nullable: false } },
      { field: 'location_en', type: 'string', meta: { interface: 'input', required: true, width: 'half' }, schema: { max_length: 255, is_nullable: false } },
      { field: 'description_de', type: 'text', meta: { interface: 'input-multiline', required: true, width: 'full' }, schema: { is_nullable: false } },
      { field: 'description_en', type: 'text', meta: { interface: 'input-multiline', required: true, width: 'full' }, schema: { is_nullable: false } },
      { field: 'start_at', type: 'timestamp', meta: { interface: 'datetime', special: ['date-time'], required: true, width: 'half' }, schema: { data_type: 'timestamp with time zone', is_nullable: false } },
      { field: 'end_at', type: 'timestamp', meta: { interface: 'datetime', special: ['date-time'], width: 'half' }, schema: { data_type: 'timestamp with time zone', is_nullable: true } },
      { field: 'registration_url', type: 'string', meta: { interface: 'input', special: ['url'], width: 'half' }, schema: { max_length: 500, is_nullable: true } },
      { field: 'published_at', type: 'timestamp', meta: { interface: 'datetime', special: ['date-time'], width: 'half' }, schema: { data_type: 'timestamp with time zone', is_nullable: true } },
    ],
  },
  {
    collection: 'news',
    meta: {
      collection: 'news',
      icon: null,
      note: 'News posts',
      hidden: false,
      singleton: false,
    },
    schema: { name: 'news' },
    fields: [
      { field: 'slug', type: 'string', meta: { interface: 'input', required: true, width: 'half' }, schema: { is_unique: true, max_length: 255, is_nullable: false } },
      { field: 'title_de', type: 'string', meta: { interface: 'input', required: true, width: 'half' }, schema: { max_length: 255, is_nullable: false } },
      { field: 'title_en', type: 'string', meta: { interface: 'input', required: true, width: 'half' }, schema: { max_length: 255, is_nullable: false } },
      { field: 'summary_de', type: 'text', meta: { interface: 'input-multiline', required: true, width: 'full' }, schema: { is_nullable: false } },
      { field: 'summary_en', type: 'text', meta: { interface: 'input-multiline', required: true, width: 'full' }, schema: { is_nullable: false } },
      { field: 'content_de', type: 'text', meta: { interface: 'input-rich-text-html', required: true, width: 'full' }, schema: { is_nullable: false } },
      { field: 'content_en', type: 'text', meta: { interface: 'input-rich-text-html', required: true, width: 'full' }, schema: { is_nullable: false } },
      { field: 'published_at', type: 'timestamp', meta: { interface: 'datetime', special: ['date-time'], required: true, width: 'half' }, schema: { data_type: 'timestamp with time zone', is_nullable: false } },
    ],
  },
  {
    collection: 'partners',
    meta: {
      collection: 'partners',
      icon: null,
      note: 'Partners',
      hidden: false,
      singleton: false,
    },
    schema: { name: 'partners' },
    fields: [
      { field: 'name', type: 'string', meta: { interface: 'input', required: true, width: 'full' }, schema: { max_length: 255, is_nullable: false } },
      { field: 'location_de', type: 'string', meta: { interface: 'input', required: true, width: 'half' }, schema: { max_length: 255, is_nullable: false } },
      { field: 'location_en', type: 'string', meta: { interface: 'input', required: true, width: 'half' }, schema: { max_length: 255, is_nullable: false } },
      { field: 'expertise_de', type: 'text', meta: { interface: 'input-multiline', required: true, width: 'full' }, schema: { is_nullable: false } },
      { field: 'expertise_en', type: 'text', meta: { interface: 'input-multiline', required: true, width: 'full' }, schema: { is_nullable: false } },
      { field: 'role_de', type: 'text', meta: { interface: 'input-multiline', required: true, width: 'full' }, schema: { is_nullable: false } },
      { field: 'role_en', type: 'text', meta: { interface: 'input-multiline', required: true, width: 'full' }, schema: { is_nullable: false } },
      { field: 'website', type: 'string', meta: { interface: 'input', special: ['url'], width: 'half' }, schema: { max_length: 500, is_nullable: true } },
      { field: 'published_at', type: 'timestamp', meta: { interface: 'datetime', special: ['date-time'], width: 'half' }, schema: { data_type: 'timestamp with time zone', is_nullable: true } },
    ],
  },
  {
    collection: 'testimonials',
    meta: {
      collection: 'testimonials',
      icon: null,
      note: 'Testimonials',
      hidden: false,
      singleton: false,
    },
    schema: { name: 'testimonials' },
    fields: [
      { field: 'quote_de', type: 'text', meta: { interface: 'input-multiline', required: true, width: 'full' }, schema: { is_nullable: false } },
      { field: 'quote_en', type: 'text', meta: { interface: 'input-multiline', required: true, width: 'full' }, schema: { is_nullable: false } },
      { field: 'author_name', type: 'string', meta: { interface: 'input', required: true, width: 'half' }, schema: { max_length: 255, is_nullable: false } },
      { field: 'author_title_de', type: 'string', meta: { interface: 'input', width: 'half' }, schema: { max_length: 255, is_nullable: true } },
      { field: 'author_title_en', type: 'string', meta: { interface: 'input', width: 'half' }, schema: { max_length: 255, is_nullable: true } },
      { field: 'company_name', type: 'string', meta: { interface: 'input', required: true, width: 'half' }, schema: { max_length: 255, is_nullable: false } },
      { field: 'featured', type: 'boolean', meta: { interface: 'boolean', width: 'half' }, schema: { default_value: false, is_nullable: true } },
    ],
  },
  {
    collection: 'team',
    meta: {
      collection: 'team',
      icon: null,
      note: 'Team members',
      hidden: false,
      singleton: false,
    },
    schema: { name: 'team' },
    fields: [
      { field: 'name', type: 'string', meta: { interface: 'input', required: true, width: 'full' }, schema: { max_length: 255, is_nullable: false } },
      { field: 'role_de', type: 'string', meta: { interface: 'input', required: true, width: 'half' }, schema: { max_length: 255, is_nullable: false } },
      { field: 'role_en', type: 'string', meta: { interface: 'input', required: true, width: 'half' }, schema: { max_length: 255, is_nullable: false } },
      { field: 'bio_de', type: 'text', meta: { interface: 'input-multiline', width: 'full' }, schema: { is_nullable: true } },
      { field: 'bio_en', type: 'text', meta: { interface: 'input-multiline', width: 'full' }, schema: { is_nullable: true } },
      { field: 'order', type: 'integer', meta: { interface: 'input', width: 'half' }, schema: { default_value: 1, is_nullable: true } },
    ],
  },
  {
    collection: 'resources',
    meta: {
      collection: 'resources',
      icon: null,
      note: 'Resources',
      hidden: false,
      singleton: false,
    },
    schema: { name: 'resources' },
    fields: [
      { field: 'title_de', type: 'string', meta: { interface: 'input', required: true, width: 'half' }, schema: { max_length: 255, is_nullable: false } },
      { field: 'title_en', type: 'string', meta: { interface: 'input', required: true, width: 'half' }, schema: { max_length: 255, is_nullable: false } },
      { field: 'description_de', type: 'text', meta: { interface: 'input-multiline', width: 'full' }, schema: { is_nullable: true } },
      { field: 'description_en', type: 'text', meta: { interface: 'input-multiline', width: 'full' }, schema: { is_nullable: true } },
      { field: 'type', type: 'string', meta: { interface: 'select-dropdown', options: { choices: [{ text: 'PDF', value: 'pdf' }, { text: 'Template', value: 'template' }, { text: 'Guideline', value: 'guideline' }, { text: 'Video', value: 'video' }, { text: 'Link', value: 'link' }] }, required: true, width: 'half' }, schema: { max_length: 255, is_nullable: false } },
      { field: 'url', type: 'string', meta: { interface: 'input', special: ['url'], width: 'half' }, schema: { max_length: 500, is_nullable: true } },
      { field: 'published_at', type: 'timestamp', meta: { interface: 'datetime', special: ['date-time'], width: 'half' }, schema: { data_type: 'timestamp with time zone', is_nullable: true } },
    ],
  },
];

const fileRelations = [
  { collection: 'projects', field: 'images', related_collection: 'directus_files', type: 'many-to-many' },
  { collection: 'projects', field: 'documents', related_collection: 'directus_files', type: 'many-to-many' },
  { collection: 'events', field: 'cover_image', related_collection: 'directus_files', type: 'many-to-one' },
  { collection: 'news', field: 'cover_image', related_collection: 'directus_files', type: 'many-to-one' },
  { collection: 'partners', field: 'logo', related_collection: 'directus_files', type: 'many-to-one' },
  { collection: 'testimonials', field: 'company_logo', related_collection: 'directus_files', type: 'many-to-one' },
  { collection: 'team', field: 'photo', related_collection: 'directus_files', type: 'many-to-one' },
  { collection: 'resources', field: 'file', related_collection: 'directus_files', type: 'many-to-one' },
];

async function applySchema() {
  console.log('Applying schema...\n');

  // Create collections and fields
  for (const collectionDef of collections) {
    try {
      const exists = await collectionExists(collectionDef.collection);
      if (exists) {
        console.log(`✓ Collection "${collectionDef.collection}" already exists`);
      } else {
        await createCollection(collectionDef);
        console.log(`✓ Created collection "${collectionDef.collection}"`);
      }

      // Create fields
      for (const fieldDef of collectionDef.fields) {
        const fieldExists = await fieldExists(collectionDef.collection, fieldDef.field);
        if (fieldExists) {
          console.log(`  ✓ Field "${fieldDef.field}" already exists`);
        } else {
          await createField(collectionDef.collection, fieldDef);
          console.log(`  ✓ Created field "${fieldDef.field}"`);
        }
      }
    } catch (error) {
      console.error(`✗ Error processing collection "${collectionDef.collection}":`, error.message);
    }
  }

  // Create file relations
  console.log('\nCreating file relations...');
  for (const relation of fileRelations) {
    try {
      const exists = await relationExists(relation.collection, relation.field);
      if (exists) {
        console.log(`✓ Relation "${relation.collection}.${relation.field}" already exists`);
      } else {
        // For many-to-one, create a simple relation
        if (relation.type === 'many-to-one') {
          await createRelation({
            collection: relation.collection,
            field: relation.field,
            related_collection: relation.related_collection,
            meta: {
              many_collection: relation.collection,
              many_field: relation.field,
              one_collection: relation.related_collection,
              one_field: null,
            },
            schema: {
              table: relation.collection,
              column: relation.field,
              foreign_key_table: relation.related_collection,
              foreign_key_column: 'id',
            },
          });
        } else if (relation.type === 'many-to-many') {
          // M2M relations need junction table
          await createRelation({
            collection: relation.collection,
            field: relation.field,
            related_collection: relation.related_collection,
            meta: {
              many_collection: relation.collection,
              many_field: 'id',
              one_collection: relation.related_collection,
              one_field: null,
              junction_field: `${relation.related_collection}_id`,
            },
            schema: {
              table: `${relation.collection}_${relation.field}`,
              column: `${relation.collection}_id`,
              foreign_key_table: relation.related_collection,
              foreign_key_column: 'id',
            },
          });
        }
        console.log(`✓ Created relation "${relation.collection}.${relation.field}"`);
      }
    } catch (error) {
      console.error(`✗ Error creating relation "${relation.collection}.${relation.field}":`, error.message);
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
    await login();
    console.log('✓ Logged in successfully\n');
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
