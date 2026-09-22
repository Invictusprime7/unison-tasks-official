/**
 * Phase 0B CI check — no NEW direct canonical VFS writers.
 *
 * Direct `importFiles(...)` / `importBuilderFiles(...)` calls push a file map
 * into working canonical VFS without necessarily passing through
 * VFSCommitService. The remaining call sites are legacy hydration/import
 * paths; this lint freezes them at a recorded baseline so no new bypass can be
 * introduced without an explicit, reviewed baseline change.
 *
 * Exempt a call site by annotating the call (or the line above it) with:
 *   // canonical-vfs-exempt: <reason>
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const SRC = join(ROOT, 'src');
const BASELINE_PATH = join(ROOT, 'scripts/canonical-vfs-write-baseline.json');
const CALL_PATTERN = /(?:^|[^A-Za-z0-9_$])(?:[A-Za-z0-9_$]+(?:\.current)?\.)?(?:importBuilderFiles|importFiles)\s*\(/;

export function countDirectVfsWrites(text) {
  let count = 0;
  const lines = text.split('\n');
  lines.forEach((line, index) => {
    if (!CALL_PATTERN.test(line)) return;
    // Declarations and re-exports are not call sites.
    if (/\b(?:const|function|export)\b[^(]*\b(?:importBuilderFiles|importFiles)\s*[=(]/.test(line) && !line.includes('(')) return;
    if (/^\s*(?:import|export)\b/.test(line)) return;
    const annotated =
      line.includes('canonical-vfs-exempt') ||
      (index > 0 && lines[index - 1].includes('canonical-vfs-exempt'));
    if (annotated) return;
    count += 1;
  });
  return count;
}

/**
 * P0.5 — exemption audit.
 *
 * Every `// canonical-vfs-exempt: <reason>` must state a reason that maps to an
 * approved category in scripts/canonical-vfs-exemption-registry.json, and the
 * per-file, per-reason counts are frozen at the audited baseline. The
 * highest-risk category (`optimistic-hmr`) must additionally be chained to a
 * durable write in the same code path.
 */
export const EXEMPTION_REGISTRY_PATH = 'scripts/canonical-vfs-exemption-registry.json';
const COMMIT_CHAIN_PATTERN = /commitMutation|commitBuilderFiles|saveDraft\s*\(/;
const COMMIT_CHAIN_WINDOW = 120;

export function collectExemptions(text) {
  const lines = text.split('\n');
  const found = [];
  lines.forEach((line, index) => {
    const match = line.match(/canonical-vfs-exempt:\s*(.+?)\s*$/);
    if (!match) return;
    found.push({ line: index + 1, reason: match[1] });
  });
  return found;
}

export function auditExemptions(fileTexts, registry) {
  const violations = [];
  const seen = {};

  for (const [file, text] of Object.entries(fileTexts)) {
    const lines = text.split('\n');
    for (const { line, reason } of collectExemptions(text)) {
      const category = registry.reasons[reason];
      if (!category) {
        violations.push(`${file}:${line} — unregistered exemption reason: "${reason}"`);
        continue;
      }
      if (!registry.categories[category]) {
        violations.push(`${file}:${line} — reason maps to unknown category "${category}"`);
        continue;
      }
      seen[file] = seen[file] ?? {};
      seen[file][reason] = (seen[file][reason] ?? 0) + 1;

      if (category === 'optimistic-hmr') {
        const window = lines.slice(line, line + COMMIT_CHAIN_WINDOW).join('\n');
        if (!COMMIT_CHAIN_PATTERN.test(window)) {
          violations.push(
            `${file}:${line} — optimistic-hmr exemption is not chained to commitMutation/saveDraft within ${COMMIT_CHAIN_WINDOW} lines`,
          );
        }
      }
    }
  }

  for (const [file, reasons] of Object.entries(seen)) {
    for (const [reason, count] of Object.entries(reasons)) {
      const allowed = registry.baseline[file]?.[reason] ?? 0;
      if (count > allowed) {
        violations.push(`${file} — "${reason}": ${count} exemption(s), baseline allows ${allowed}`);
      }
    }
  }

  return violations;
}

function collectCounts(dir) {
  const counts = {};
  function walk(currentDir) {
    for (const name of readdirSync(currentDir)) {
      const full = join(currentDir, name);
      const st = statSync(full);
      if (st.isDirectory()) {
        if (name === 'node_modules' || name === 'dist' || name.startsWith('.')) continue;
        walk(full);
        continue;
      }
      if (!/\.(ts|tsx)$/.test(name)) continue;
      if (/\.test\.tsx?$|\.spec\.tsx?$/.test(name)) continue;
      const rel = relative(ROOT, full).split(sep).join('/');
      const count = countDirectVfsWrites(readFileSync(full, 'utf8'));
      if (count > 0) counts[rel] = count;
    }
  }
  walk(dir);
  return counts;
}

export function collectSourceFiles(dir = SRC) {
  const texts = {};
  function walk(currentDir) {
    for (const name of readdirSync(currentDir)) {
      const full = join(currentDir, name);
      const st = statSync(full);
      if (st.isDirectory()) {
        if (name === 'node_modules' || name === 'dist' || name.startsWith('.')) continue;
        walk(full);
        continue;
      }
      if (!/\.(ts|tsx)$/.test(name)) continue;
      if (/\.test\.tsx?$|\.spec\.tsx?$/.test(name)) continue;
      texts[relative(ROOT, full).split(sep).join('/')] = readFileSync(full, 'utf8');
    }
  }
  walk(dir);
  return texts;
}

async function main() {
  const counts = collectCounts(SRC);

  if (process.argv.includes('--write-baseline')) {
    const { writeFileSync } = await import('node:fs');
    writeFileSync(BASELINE_PATH, `${JSON.stringify(counts, null, 2)}\n`);
    console.log('[lint-canonical-vfs-writes] baseline written.');
    return;
  }

  let baseline = {};
  try {
    baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf8'));
  } catch {
    console.error('[lint-canonical-vfs-writes] FAIL — missing baseline file.');
    process.exit(1);
  }

  const violations = [];
  for (const [file, count] of Object.entries(counts)) {
    const allowed = baseline[file] ?? 0;
    if (count > allowed) {
      violations.push(`${file}: ${count} direct VFS write(s), baseline allows ${allowed}`);
    }
  }

  if (violations.length === 0) {
    console.log('[lint-canonical-vfs-writes] OK — no new direct canonical VFS writers.');
    process.exit(0);
  }

  console.error(
    `\n[lint-canonical-vfs-writes] FAIL — ${violations.length} new direct VFS writer(s).\n` +
      `Route the mutation through commitMutation, or annotate a hydration/import-only\n` +
      `call site with "// canonical-vfs-exempt: <reason>".\n`,
  );
  for (const v of violations) console.error(`  ${v}`);
  process.exit(1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
