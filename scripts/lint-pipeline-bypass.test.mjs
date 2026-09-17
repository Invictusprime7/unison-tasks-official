import assert from 'node:assert/strict';
import test from 'node:test';
import {
  findBuilderDraftMutations,
  findBodySubstitutionViolations,
  findDeprecatedPagePruningUsages,
  findForbiddenUsages,
  findWizardHandoffSealViolations,
  findWizardRegistryMutationViolations,
} from './lint-pipeline-bypass.mjs';

test('ignores forbidden symbols in comments and strings', () => {
  const source = `
    // executeCanonicalPipeline is forbidden.
    /** recompileFromPlayground is also forbidden. */
    const message = 'executeCanonicalPipeline';
  `;

  assert.deepEqual(findForbiddenUsages(source), []);
});

test('reports forbidden imports and executable references', () => {
  const source = `
    import { executeCanonicalPipeline } from './pipeline';
    executeCanonicalPipeline(input);
  `;

  assert.deepEqual(
    findForbiddenUsages(source).map(({ line, symbol }) => ({ line, symbol })),
    [
      { line: 2, symbol: 'executeCanonicalPipeline' },
      { line: 3, symbol: 'executeCanonicalPipeline' },
    ],
  );
});

test('reports direct builder_drafts mutations but ignores reads and strings', () => {
  const source = `
    const note = "builder_drafts.update";
    const read = supabase.from('builder_drafts').select('*');
    const write = supabase.from('builder_drafts').update({ metadata: {} }).eq('id', draftId);
  `;

  assert.deepEqual(
    findBuilderDraftMutations(source).map(({ line, symbol }) => ({ line, symbol })),
    [{ line: 4, symbol: 'builder_drafts.update' }],
  );
});

test('blocks selected-page pruning calls while allowing documentation references', () => {
  const source = `
    // dropUnacceptablePages is deprecated.
    const note = 'dropUnacceptablePages';
    dropUnacceptablePages(snapshot, failures);
  `;
  assert.deepEqual(
    findDeprecatedPagePruningUsages(source).map(({ line, symbol }) => ({ line, symbol })),
    [{ line: 4, symbol: 'dropUnacceptablePages' }],
  );
});

test('blocks post-Lane-A page registry assignment and deletion', () => {
  const source = `
    siteBundleSnapshot.pageRegistry.pages[id] = replacement;
    delete generatedSiteBundleSnapshot.pageRegistry.pages[failedId];
  `;
  assert.equal(findWizardRegistryMutationViolations(source).length, 2);
});

test('requires sealed launch artifacts and committed snapshots before Wizard handoff', () => {
  assert.equal(findWizardHandoffSealViolations('navigate("/web-builder", {})').length, 1);
  assert.deepEqual(findWizardHandoffSealViolations(`
    if (!isSealedSnapshot(launchArtifacts.siteBundleSnapshot)) throw new Error('blocked');
    if (!isSealedSnapshot(canonicalSiteBundleSnapshot)) throw new Error('blocked');
    navigate("/web-builder", {});
  `), []);
});

test('allows canonical fallback only for explicit preview-first artifacts', () => {
  assert.equal(findBodySubstitutionViolations(`
    buildCanonicalLaunchArtifacts({ allowCanonicalPageFallback: true });
  `).length, 1);
  assert.deepEqual(findBodySubstitutionViolations(`
    buildCanonicalLaunchArtifacts({
      allowCanonicalPageFallback: true,
      previewFirst: true,
    });
  `), []);
});
