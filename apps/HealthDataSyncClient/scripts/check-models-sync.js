#!/usr/bin/env node
/**
 * Compares the field names of the client's TypeScript Health Connect payload
 * types against a hand-maintained manifest of the backend C# DTO fields
 * (see scripts/model-sync-manifests/*.json). Run via `npm run check:models-sync`.
 *
 * This is a manual-diff check, not codegen: whenever a backend DTO's fields
 * change, update the matching manifest file's "fields" array by hand.
 */
const fs = require('fs');
const path = require('path');

const manifestDir = path.join(__dirname, 'model-sync-manifests');
const tsTypesFile = path.join(
  __dirname,
  '..',
  'src',
  'lib',
  'services',
  'healthConnect',
  'healthConnectTypes.ts',
);

// Removes the contents of nested `{ ... }` object literals so the field
// regex below only ever matches this type's own top-level property names.
function stripNestedBraces(body) {
  let result = '';
  let depth = 0;

  for (const char of body) {
    if (char === '{') {
      depth++;
      continue;
    }
    if (char === '}') {
      depth = Math.max(0, depth - 1);
      continue;
    }
    if (depth === 0) {
      result += char;
    }
  }

  return result;
}

function extractTypeFields(source, typeName) {
  const typeRegex = new RegExp(
    `export type ${typeName} = \\{([\\s\\S]*?)\\n\\};`,
  );
  const match = source.match(typeRegex);

  if (!match) {
    return null;
  }

  const topLevelBody = stripNestedBraces(match[1]);
  const fieldRegex = /^\s*([a-zA-Z0-9_]+)\??:/gm;
  const fields = [];
  let fieldMatch;

  while ((fieldMatch = fieldRegex.exec(topLevelBody))) {
    fields.push(fieldMatch[1]);
  }

  return fields;
}

function checkManifest(fileName, tsSource) {
  const typeName = path.basename(fileName, '.json');
  const manifest = JSON.parse(
    fs.readFileSync(path.join(manifestDir, fileName), 'utf8'),
  );
  const clientFields = extractTypeFields(tsSource, typeName);

  if (clientFields == null) {
    console.error(
      `✗ ${typeName}: no "export type ${typeName} = { ... }" found in ${tsTypesFile}`,
    );
    return false;
  }

  const missingInClient = manifest.fields.filter(
    field => !clientFields.includes(field),
  );
  const extraInClient = clientFields.filter(
    field => !manifest.fields.includes(field),
  );

  if (missingInClient.length === 0 && extraInClient.length === 0) {
    console.log(`✓ ${typeName} in sync`);
    return true;
  }

  console.error(
    `✗ ${typeName} drift detected (backend: ${manifest.backendFile}):`,
  );
  if (missingInClient.length) {
    console.error(`  missing in client: ${missingInClient.join(', ')}`);
  }
  if (extraInClient.length) {
    console.error(
      `  extra in client (not in backend manifest): ${extraInClient.join(
        ', ',
      )}`,
    );
  }
  return false;
}

function main() {
  const tsSource = fs.readFileSync(tsTypesFile, 'utf8');
  const manifestFiles = fs
    .readdirSync(manifestDir)
    .filter(file => file.endsWith('.json'));

  const results = manifestFiles.map(file => checkManifest(file, tsSource));
  const hasDrift = results.some(inSync => !inSync);

  process.exit(hasDrift ? 1 : 0);
}

main();
