#!/usr/bin/env npx tsx
/**
 * Template Intent Lint Script
 * 
 * Scans template manifests and generated HTML for intent references.
 * Fails if any intent isn't core or alias-resolvable.
 * 
 * Usage:
 *   npx tsx scripts/lint-template-intents.ts [path-to-templates-dir]
 * 
 * Exit code 0 = all intents valid
 * Exit code 1 = invalid intents found
 */

import { CORE_INTENTS } from '../src/coreIntents';
import { INTENT_ALIASES, normalizeIntent } from '../src/runtime/intentAliases';
import * as fs from 'fs';
import * as path from 'path';

const INTENT_ATTR_REGEX = /data-ut-intent="([^"]+)"/g;
const INTENT_PROP_REGEX = /"intent"\s*:\s*"([^"]+)"/g;

function scanFile(filePath: string): string[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const intents: string[] = [];

  let match: RegExpExecArray | null;
  
  // Scan HTML attributes
  while ((match = INTENT_ATTR_REGEX.exec(content)) !== null) {
    intents.push(match[1]);
  }
  
  // Scan JSON intent properties
  while ((match = INTENT_PROP_REGEX.exec(content)) !== null) {
    intents.push(match[1]);
  }

  return intents;
}

function scanDir(dir: string): Map<string, string[]> {
  const results = new Map<string, string[]>();
  
  if (!fs.existsSync(dir)) {
    console.warn(`Directory not found: ${dir}`);
    return results;
  }

  const files = fs.readdirSync(dir, { recursive: true }) as string[];
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isFile() && /\.(tsx?|jsx?|html|json)$/.test(file)) {
      const intents = scanFile(fullPath);
      if (intents.length > 0) {
        results.set(fullPath, intents);
      }
    }
  }

  return results;
}

function validateIntent(intent: string): { valid: boolean; normalized?: string } {
  if ((CORE_INTENTS as readonly string[]).includes(intent)) {
    return { valid: true, normalized: intent };
  }
  
  const normalized = normalizeIntent(intent);
  if ((CORE_INTENTS as readonly string[]).includes(normalized)) {
    return { valid: true, normalized };
  }
  
  return { valid: false };
}

// Main
const targetDir = process.argv[2] || 'src';
console.log(`🔍 Scanning "${targetDir}" for intent references...\n`);

const fileIntents = scanDir(targetDir);
let totalIntents = 0;
let invalidCount = 0;
const invalidIntents: Array<{ file: string; intent: string }> = [];

for (const [file, intents] of fileIntents) {
  for (const intent of intents) {
    totalIntents++;
    const result = validateIntent(intent);
    if (!result.valid) {
      invalidCount++;
      invalidIntents.push({ file, intent });
    }
  }
}

console.log(`📊 Scanned ${fileIntents.size} files, found ${totalIntents} intent references\n`);

if (invalidIntents.length > 0) {
  console.error(`❌ ${invalidCount} invalid intent(s) found:\n`);
  for (const { file, intent } of invalidIntents) {
    console.error(`  ${file}: "${intent}"`);
  }
  console.error(`\nAll intents must be core (CORE_INTENTS) or alias-resolvable (INTENT_ALIASES).`);
  console.error(`Valid core intents: ${[...CORE_INTENTS].join(', ')}`);
  process.exit(1);
} else {
  console.log(`✅ All ${totalIntents} intent references are valid!`);
  process.exit(0);
}
