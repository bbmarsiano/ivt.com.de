#!/usr/bin/env node

/**
 * Compare current Directus schema with code-based snapshot
 * Shows differences between current.directus.json and ivt-schema.from-code.json
 */

const fs = require('fs');
const path = require('path');

const CURRENT_SCHEMA_PATH = path.join(__dirname, '..', 'directus', 'snapshots', 'current.directus.json');
const CODE_SCHEMA_PATH = path.join(__dirname, '..', 'directus', 'snapshots', 'ivt-schema.from-code.json');

function loadJSON(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function normalizeField(field) {
  return {
    field: field.field,
    type: field.type,
    required: field.meta?.required || field.schema?.is_nullable === false,
    unique: field.schema?.is_unique || false,
    nullable: field.schema?.is_nullable !== false,
    enum: field.meta?.options?.choices || null,
    default_value: field.schema?.default_value || null,
  };
}

function compareCollections(current, code) {
  const differences = [];

  // Find collections in code but not in current
  const currentCollectionNames = new Set(current.map((c) => c.collection));
  const codeCollectionNames = new Set(code.map((c) => c.collection));

  for (const codeCol of code) {
    if (!currentCollectionNames.has(codeCol.collection)) {
      differences.push({
        type: 'missing_collection',
        collection: codeCol.collection,
        message: `Collection "${codeCol.collection}" exists in code but not in Directus`,
      });
    }
  }

  // Compare collections that exist in both
  for (const codeCol of code) {
    const currentCol = current.find((c) => c.collection === codeCol.collection);
    if (!currentCol) continue;

    // Compare fields
    const currentFields = new Map(
      currentCol.fields.map((f) => [f.field, normalizeField(f)])
    );
    const codeFields = new Map(
      codeCol.fields.map((f) => [f.field, normalizeField(f)])
    );

    // Fields in code but not in current
    for (const [fieldName, codeField] of codeFields) {
      if (!currentFields.has(fieldName)) {
        differences.push({
          type: 'missing_field',
          collection: codeCol.collection,
          field: fieldName,
          message: `Field "${codeCol.collection}.${fieldName}" exists in code but not in Directus`,
        });
      }
    }

    // Compare existing fields
    for (const [fieldName, codeField] of codeFields) {
      const currentField = currentFields.get(fieldName);
      if (!currentField) continue;

      // Compare type
      if (currentField.type !== codeField.type) {
        differences.push({
          type: 'type_mismatch',
          collection: codeCol.collection,
          field: fieldName,
          message: `Field "${codeCol.collection}.${fieldName}": type mismatch (Directus: ${currentField.type}, Code: ${codeField.type})`,
        });
      }

      // Compare required
      if (currentField.required !== codeField.required) {
        differences.push({
          type: 'required_mismatch',
          collection: codeCol.collection,
          field: fieldName,
          message: `Field "${codeCol.collection}.${fieldName}": required mismatch (Directus: ${currentField.required}, Code: ${codeField.required})`,
        });
      }

      // Compare unique
      if (currentField.unique !== codeField.unique) {
        differences.push({
          type: 'unique_mismatch',
          collection: codeCol.collection,
          field: fieldName,
          message: `Field "${codeCol.collection}.${fieldName}": unique mismatch (Directus: ${currentField.unique}, Code: ${codeField.unique})`,
        });
      }

      // Compare enum values
      if (codeField.enum && currentField.enum) {
        const codeEnumValues = new Set(codeField.enum.map((c) => c.value));
        const currentEnumValues = new Set(currentField.enum.map((c) => c.value));
        if (codeEnumValues.size !== currentEnumValues.size || 
            [...codeEnumValues].some((v) => !currentEnumValues.has(v))) {
          differences.push({
            type: 'enum_mismatch',
            collection: codeCol.collection,
            field: fieldName,
            message: `Field "${codeCol.collection}.${fieldName}": enum values mismatch (Directus: [${[...currentEnumValues].join(', ')}], Code: [${[...codeEnumValues].join(', ')}])`,
          });
        }
      } else if (codeField.enum && !currentField.enum) {
        differences.push({
          type: 'enum_mismatch',
          collection: codeCol.collection,
          field: fieldName,
          message: `Field "${codeCol.collection}.${fieldName}": code expects enum but Directus field is not enum`,
        });
      }
    }
  }

  return differences;
}

function printDifferences(differences) {
  if (differences.length === 0) {
    console.log('✓ No differences found - Directus schema matches code 1:1');
    return;
  }

  console.log(`\n✗ Found ${differences.length} difference(s):\n`);

  const byType = {
    missing_collection: [],
    missing_field: [],
    type_mismatch: [],
    required_mismatch: [],
    unique_mismatch: [],
    enum_mismatch: [],
  };

  differences.forEach((diff) => {
    byType[diff.type] = byType[diff.type] || [];
    byType[diff.type].push(diff);
  });

  if (byType.missing_collection.length > 0) {
    console.log('Missing Collections:');
    byType.missing_collection.forEach((diff) => {
      console.log(`  - ${diff.message}`);
    });
    console.log('');
  }

  if (byType.missing_field.length > 0) {
    console.log('Missing Fields:');
    byType.missing_field.forEach((diff) => {
      console.log(`  - ${diff.message}`);
    });
    console.log('');
  }

  if (byType.type_mismatch.length > 0) {
    console.log('Type Mismatches:');
    byType.type_mismatch.forEach((diff) => {
      console.log(`  - ${diff.message}`);
    });
    console.log('');
  }

  if (byType.required_mismatch.length > 0) {
    console.log('Required Flag Mismatches:');
    byType.required_mismatch.forEach((diff) => {
      console.log(`  - ${diff.message}`);
    });
    console.log('');
  }

  if (byType.unique_mismatch.length > 0) {
    console.log('Unique Flag Mismatches:');
    byType.unique_mismatch.forEach((diff) => {
      console.log(`  - ${diff.message}`);
    });
    console.log('');
  }

  if (byType.enum_mismatch.length > 0) {
    console.log('Enum Value Mismatches:');
    byType.enum_mismatch.forEach((diff) => {
      console.log(`  - ${diff.message}`);
    });
    console.log('');
  }
}

async function main() {
  try {
    console.log('Comparing Directus schema with code snapshot...\n');
    console.log(`Current schema: ${CURRENT_SCHEMA_PATH}`);
    console.log(`Code schema: ${CODE_SCHEMA_PATH}\n`);

    if (!fs.existsSync(CURRENT_SCHEMA_PATH)) {
      console.error(`Error: Current schema file not found: ${CURRENT_SCHEMA_PATH}`);
      console.error('\nExport current schema first:');
      console.error('  node scripts/directus-export-current-schema.js');
      process.exit(1);
    }

    const currentSchema = loadJSON(CURRENT_SCHEMA_PATH);
    const codeSchema = loadJSON(CODE_SCHEMA_PATH);

    const differences = compareCollections(
      currentSchema.collections || [],
      codeSchema.collections || []
    );

    printDifferences(differences);

    if (differences.length > 0) {
      console.log('\nTo apply code schema:');
      console.log('  ./scripts/directus-apply-schema.sh');
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error('Error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
