#!/usr/bin/env node

/**
 * Fix Directus permissions for CMS collections
 * Ensures the current user's role has read/create/update/delete permissions
 * for projects, events, news, and testimonials collections.
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

if (!DIRECTUS_TOKEN) {
  console.error('Error: DIRECTUS_TOKEN must be set');
  console.error('Set it in .env.directus or export it as an environment variable');
  process.exit(1);
}

// CMS collections to fix permissions for
const CMS_COLLECTIONS = ['projects', 'events', 'news', 'testimonials', 'partners', 'team', 'about', 'resources', 'resource_categories'];

// Actions to ensure permissions for
const ACTIONS = ['read', 'create', 'update', 'delete'];

// Minimal permissive permission rules
const PERMISSION_RULES = {
  fields: ['*'],
  permissions: {},
  validation: {},
  presets: {},
};

async function fetchAPI(endpoint, options = {}) {
  const url = `${DIRECTUS_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (DIRECTUS_TOKEN) {
    headers.Authorization = `Bearer ${DIRECTUS_TOKEN}`;
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

  // Handle 204 No Content
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

async function getCurrentUser() {
  console.log('Getting current user information...');
  const response = await fetchAPI('/users/me');
  const user = response.data || response;
  
  if (!user || !user.role) {
    throw new Error('Could not get current user or user has no role');
  }

  console.log(`✓ Current user: ${user.email || user.id}`);
  console.log(`✓ Role ID: ${user.role}`);
  console.log('');

  return user;
}

async function getExistingPermissions(roleId, collection) {
  try {
    // Fetch permissions for this role and collection
    const endpoint = `/permissions?filter[role][_eq]=${roleId}&filter[collection][_eq]=${collection}&limit=200`;
    const response = await fetchAPI(endpoint);
    const permissions = response.data || [];
    
    // Filter to only permissions for this specific collection (API might return related ones)
    return permissions.filter(p => p.collection === collection && p.role === roleId);
  } catch (error) {
    console.warn(`  ⚠ Could not fetch existing permissions for ${collection}: ${error.message}`);
    return [];
  }
}

async function createPermission(roleId, collection, action) {
  const permission = {
    role: roleId,
    collection: collection,
    action: action,
    ...PERMISSION_RULES,
  };

  const response = await fetchAPI('/permissions', {
    method: 'POST',
    body: JSON.stringify(permission),
  });

  return response.data || response;
}

async function updatePermission(permissionId, roleId, collection, action) {
  const permission = {
    role: roleId,
    collection: collection,
    action: action,
    ...PERMISSION_RULES,
  };

  const response = await fetchAPI(`/permissions/${permissionId}`, {
    method: 'PATCH',
    body: JSON.stringify(permission),
  });

  return response.data || response;
}

async function fixPermissionsForCollection(roleId, collection) {
  console.log(`Processing collection: ${collection}`);

  // Get existing permissions for this collection
  const existingPermissions = await getExistingPermissions(roleId, collection);
  const permissionsByAction = {};
  
  for (const perm of existingPermissions) {
    if (perm.action && perm.role === roleId) {
      permissionsByAction[perm.action] = perm;
    }
  }

  let created = 0;
  let updated = 0;

  // Ensure permissions exist for each action
  for (const action of ACTIONS) {
    const existing = permissionsByAction[action];

    if (existing) {
      // Update existing permission
      try {
        await updatePermission(existing.id, roleId, collection, action);
        updated++;
        console.log(`  ✓ Updated ${action} permission`);
      } catch (error) {
        console.error(`  ✗ Failed to update ${action} permission: ${error.message}`);
      }
    } else {
      // Create new permission
      try {
        await createPermission(roleId, collection, action);
        created++;
        console.log(`  ✓ Created ${action} permission`);
      } catch (error) {
        console.error(`  ✗ Failed to create ${action} permission: ${error.message}`);
      }
    }
  }

  console.log(`  Summary: ${created} created, ${updated} updated\n`);

  return { created, updated };
}

async function fixPermissions() {
  console.log('Fixing Directus permissions for CMS collections...\n');
  console.log(`Directus URL: ${DIRECTUS_URL}`);
  console.log(`Collections: ${CMS_COLLECTIONS.join(', ')}\n`);

  // Get current user and role
  const user = await getCurrentUser();
  const roleId = user.role;

  let totalCreated = 0;
  let totalUpdated = 0;

  // Fix permissions for each collection
  for (const collection of CMS_COLLECTIONS) {
    const result = await fixPermissionsForCollection(roleId, collection);
    totalCreated += result.created;
    totalUpdated += result.updated;
  }

  console.log('✓ Permissions fix complete!');
  console.log(`  Total created: ${totalCreated}`);
  console.log(`  Total updated: ${totalUpdated}`);
  console.log('');

  // Optionally fix resources file field meta
  console.log('\n💡 Optional: Run "npm run directus:fix:resources-file" to enable file uploads for Resources');
  console.log('');

  console.log('Verification:');
  console.log(`  Test with: curl -H "Authorization: Bearer $DIRECTUS_TOKEN" "${DIRECTUS_URL}/items/projects?limit=1"`);
  console.log(`  Should return data (not FORBIDDEN)`);
}

async function main() {
  try {
    await fixPermissions();
  } catch (error) {
    console.error('Error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
