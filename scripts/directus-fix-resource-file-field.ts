#!/usr/bin/env node

/**
 * Fix Directus field meta for resources.file_id
 * Makes it a proper file upload field in Directus UI
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.directus explicitly
const envPath = path.join(__dirname, '..', '.env.directus');
dotenv.config({ path: envPath });

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN;

if (!DIRECTUS_TOKEN) {
  console.error('Error: DIRECTUS_TOKEN must be set in .env.directus');
  process.exit(1);
}

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${DIRECTUS_URL}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${DIRECTUS_TOKEN}`,
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.text();
    const errorMsg = `API error (${response.status}) at ${url}: ${error}`;
    throw new Error(errorMsg);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

async function fixResourceFileField() {
  console.log('Fixing resources.file_id field meta...\n');
  console.log(`Directus URL: ${DIRECTUS_URL}`);
  console.log(`Token: ${DIRECTUS_TOKEN!.substring(0, 10)}... (hidden)\n`);

  try {
    // PATCH the field meta
    const payload = {
      meta: {
        special: ['file'],
        interface: 'file',
        display: 'file',
        options: null,
        display_options: null,
        hidden: false,
        readonly: false,
        required: false,
        searchable: true,
      },
    };

    console.log('Patching /fields/resources/file_id...');
    await fetchAPI('/fields/resources/file_id', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });

    console.log('[IVT][CMS] fixed resources.file_id meta (file upload enabled)');
    console.log('\n✓ Success!');
    console.log('\nVerification:');
    console.log(`  curl -H "Authorization: Bearer $DIRECTUS_TOKEN" "${DIRECTUS_URL}/fields/resources/file_id" | jq '.meta.special, .meta.interface'`);
    console.log(`  Should show: ["file"] and "file"`);
  } catch (error: any) {
    if (error.message.includes('403')) {
      console.error('\n✗ Error: 403 Forbidden');
      console.error('  Check that DIRECTUS_TOKEN has admin permissions');
      console.error('  Or run: npm run directus:fix:permissions');
    } else if (error.message.includes('404')) {
      console.error('\n✗ Error: 404 Not Found');
      console.error('  Check that resources collection and file_id field exist');
      console.error('  Run migrations if needed');
    } else {
      console.error('\n✗ Error:', error.message);
    }
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

async function main() {
  try {
    await fixResourceFileField();
  } catch (error: any) {
    console.error('Unexpected error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
