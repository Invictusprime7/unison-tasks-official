import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const required = [
  ['AGENTS.md', 'UnisonAppBuilder` is the sole fresh-launch application author'],
  ['AGENTS.md', '`commitMutation` remains the only legal canonical writer'],
  ['docs/milestones/UNISON_APP_BUILDER_CANONICAL_SUBSTITUTION_MILESTONE_2026-09-30.md',
    'Deterministic contracts. Generative implementation. Canonical validation. One accepted VFS.'],
  ['.lovable/plan/ai-authoring-inside-the-wizard-launch-milestone-3-6-8-13-17-2026-09-27.md',
    'SUPERSEDED FOR FRESH-LAUNCH SEQUENCING'],
  ['docs/milestones/UNISON_AI_AUTHORED_CONVERGENCE_MILESTONE_2026-09-29.md',
    'AUTHORITY REVISION (2026-09-30)'],
  ['docs/UNISON_REGISTRY_VISUAL_COMPOSITION_CANONICAL_LAUNCH_PLAN.md',
    '`UnisonAppBuilder` owns the fresh-launch application candidate'],
  ['docs/UNISON_GUIDEBOOK_21ST_CANONICAL_CONVERGENCE_PLAN_V3.md',
    '`UnisonAppBuilder` consumes that plan to author one isolated application candidate before revision 1'],
];

const failures = [];
for (const [file, statement] of required) {
  if (!fs.existsSync(path.join(root, file))) failures.push(`${file}: missing`);
  else if (!read(file).includes(statement)) failures.push(`${file}: missing authority statement: ${statement}`);
}

const launchHeader = read('src/services/launch/launchOrchestrator.ts').slice(0, 1800);
if (launchHeader.includes('AI page authorship is retired')) {
  failures.push('launchOrchestrator header still claims AI page authorship is retired');
}

for (const file of [
  'docs/ARCHITECTURE.md',
  'docs/PREVIEW_RUNTIME_ARCHITECTURE.md',
  'docs/BUILD_TO_CANVAS_WORKFLOW.md',
]) {
  if (read(file).includes('SystemLauncher')) failures.push(`${file}: active SystemLauncher reference`);
}

if (failures.length) {
  console.error('[lint-app-builder-authority] FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('[lint-app-builder-authority] OK — fresh-launch authority is frozen on UnisonAppBuilder.');
