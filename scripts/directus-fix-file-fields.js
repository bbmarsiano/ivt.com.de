#!/usr/bin/env node

/**
 * Fix Directus file field metadata for about.hero_image_file and team.avatar_file
 * Ensures these fields are properly configured as file-image fields
 */

const dotenv = require('dotenv');
const path = require('path');

// Load .env.directus explicitly
const envPath = path.join(__dirname, '..', '.env.directus');
dotenv.config({ path: envPath });

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN;

if (!DIRECTUS_TOKEN) {
  console.error('❌ DIRECTUS_TOKEN not set in .env.directus');
  process.exit(1);
}

async function fetchAPI(endpoint, options = {}) {
  const url = `${DIRECTUS_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DIRECTUS_TOKEN}`,
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Directus API error (${response.status}): ${error}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

async function getField(collection, field) {
  try {
    const response = await fetchAPI(`/fields/${collection}/${field}`);
    return response.data || null;
  } catch (error) {
    if (error.message.includes('404')) {
      return null;
    }
    throw error;
  }
}

async function deleteField(collection, field) {
  try {
    await fetchAPI(`/fields/${collection}/${field}`, { method: 'DELETE' });
    return true;
  } catch (error) {
    if (error.message.includes('404')) {
      return true; // Already deleted
    }
    throw error;
  }
}

async function createField(collection, field, config) {
  try {
    await fetchAPI(`/fields/${collection}`, {
      method: 'POST',
      body: JSON.stringify({
        field,
        ...config,
      }),
    });
    return true;
  } catch (error) {
    throw error;
  }
}

async function updateField(collection, field, config) {
  try {
    await fetchAPI(`/fields/${collection}/${field}`, {
      method: 'PATCH',
      body: JSON.stringify(config),
    });
    return true;
  } catch (error) {
    throw error;
  }
}

async function fixAboutHeroImage() {
  console.log('\n🖼️  Fixing about.hero_image_file field...');
  
  const collection = 'about';
  const field = 'hero_image_file';
  
  try {
    const existing = await getField(collection, field);
    
    const fieldConfig = {
      type: 'uuid',
      meta: {
        interface: 'file-image',
        special: ['file'],
        display: 'file',
        display_options: {
          crop: true,
        },
      },
      schema: {
        is_nullable: true,
        foreign_key_table: 'directus_files',
        foreign_key_column: 'id',
        on_delete: 'SET NULL',
      },
    };

    if (existing) {
      // Field exists, check if it needs updating
      const needsUpdate = 
        existing.meta?.interface !== 'file-image' ||
        !existing.meta?.special?.includes('file') ||
        existing.schema?.foreign_key_table !== 'directus_files';
      
      if (needsUpdate) {
        console.log(`  → Updating existing field metadata...`);
        await updateField(collection, field, fieldConfig);
        console.log(`  ✓ Updated about.hero_image_file field metadata`);
      } else {
        console.log(`  ✓ about.hero_image_file field is already correct`);
      }
    } else {
      // Field doesn't exist, create it
      console.log(`  → Creating field metadata...`);
      await createField(collection, field, fieldConfig);
      console.log(`  ✓ Created about.hero_image_file field metadata`);
    }
  } catch (error) {
    console.error(`  ✗ Error: ${error.message}`);
    throw error;
  }
}

async function fixTeamAvatarFile() {
  console.log('\n👤 Fixing team.avatar_file field...');
  
  const collection = 'team';
  const field = 'avatar_file';
  
  try {
    const existing = await getField(collection, field);
    
    const fieldConfig = {
      type: 'uuid',
      meta: {
        interface: 'file-image',
        special: ['file'],
        display: 'file',
        display_options: {
          crop: true,
        },
      },
      schema: {
        is_nullable: true,
        foreign_key_table: 'directus_files',
        foreign_key_column: 'id',
        on_delete: 'SET NULL',
      },
    };

    if (existing) {
      // Field exists, check if it needs fixing
      const needsFix = 
        existing.meta?.interface !== 'file-image' ||
        !existing.meta?.special?.includes('file') ||
        existing.schema?.foreign_key_table !== 'directus_files' ||
        existing.type !== 'uuid';
      
      if (needsFix) {
        console.log(`  → Field exists but is incorrect, deleting and recreating...`);
        await deleteField(collection, field);
        await createField(collection, field, fieldConfig);
        console.log(`  ✓ Recreated team.avatar_file field metadata`);
      } else {
        console.log(`  ✓ team.avatar_file field is already correct`);
      }
    } else {
      // Field doesn't exist, create it
      console.log(`  → Creating field metadata...`);
      await createField(collection, field, fieldConfig);
      console.log(`  ✓ Created team.avatar_file field metadata`);
    }
  } catch (error) {
    console.error(`  ✗ Error: ${error.message}`);
    throw error;
  }
}

async function main() {
  console.log('🔧 Fixing Directus file field metadata...\n');
  console.log(`Directus URL: ${DIRECTUS_URL}`);
  console.log(`Token: ${DIRECTUS_TOKEN.substring(0, 10)}... (hidden)\n`);

  try {
    await fixAboutHeroImage();
    await fixTeamAvatarFile();
    
    console.log('\n✅ File field metadata fixed!\n');
    console.log('💡 Verify in Directus UI:');
    console.log('   - Content → About → hero_image_file should be a file-image field');
    console.log('   - Content → Team → avatar_file should be a file-image field');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
