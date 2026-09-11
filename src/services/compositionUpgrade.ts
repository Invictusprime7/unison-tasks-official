import { collectResolvedCompositions, resolvedCompositionPathFor } from '@/platform/core/resolvedComposition';
import type { SiteBundleSnapshot } from '@/platform/core/canonicalPipeline';
import { compositionToReactFileSet, compilerOwnershipHash } from '@/sections/compositionToFileSet';
import { getCompositionById } from '@/sections/templates';
import type { SectionEntry } from '@/sections/types';
import { emptyPatchPlan } from '@/types/patchPlan';
import { buildCompositionCoverage } from './compositionCoverage';
import { commitMutation, hashVfsFiles, type CommitMutationInput, type CommitMutationResult } from './vfsCommitService';
import { runExperiencePreflight } from './experiencePreflightGate';
import { EXPERIENCE_PERFORMANCE_BUDGET } from '@/platform/core/generatedRuntimeCapabilities';
import { emitCompositionEnhancements } from '@/sections/compositionEnhancements';

export interface CompositionUpgradePlan {
  files: Record<string, string>;
  affected: Array<{ pagePath: string; sectionIds: string[] }>;
  skipped: Array<{ pagePath: string; reason: string }>;
}
export interface CompositionUpgradeProposal extends CompositionUpgradePlan {
  baseVfsHash: string;
  candidate: CommitMutationResult;
  coverage: ReturnType<typeof buildCompositionCoverage>;
}

/** Pure compiler projection. No preview, persistence, or working VFS mutations. */
export function planCompositionUpgrade(files: Record<string, string>, snapshot: SiteBundleSnapshot): CompositionUpgradePlan {
  const template = getCompositionById(snapshot.meta.templateId || '');
  const design = snapshot.meta.designIntervention;
  if (!template || !design) throw new Error('This project has no registered template composition to upgrade.');
  const result: CompositionUpgradePlan = { files: { ...files }, affected: [], skipped: [] };
  const compositions = Object.values(collectResolvedCompositions(files)).sort((a, b) => a.pageFilePath.localeCompare(b.pageFilePath));
  let remaining = Math.max(0, EXPERIENCE_PERFORMANCE_BUDGET.maxHeavyScenesPerSite - runExperiencePreflight(files).manifest.heavyInstances);
  for (const composition of compositions) {
    const pagePath = composition.pageFilePath;
    if (composition.activation?.policy === 'maximum-compatible') continue;
    const source = files[pagePath];
    const match = source?.match(/const SECTIONS = ([\s\S]*?);\r?\nconst HYDRATABLE/);
    if (!match) {
      result.skipped.push({ pagePath, reason: 'Custom page renderer requires manual replacement.' });
      continue;
    }
    let sections: SectionEntry[];
    try { sections = JSON.parse(match[1]) as SectionEntry[]; }
    catch { result.skipped.push({ pagePath, reason: 'Page content is custom code, not compiler-owned data.' }); continue; }
    if (!Array.isArray(sections) || sections.some(section => !section.id || !section.type || !section.props)) {
      result.skipped.push({ pagePath, reason: 'Page data no longer matches its composition.' }); continue;
    }
    const pageTemplate = { ...template, name: composition.templateName || template.name, compositionAlternativeId: composition.compositionAlternativeId, sections };
    const baseline = compositionToReactFileSet(pageTemplate, pagePath);
    const ownership = composition.compilerOwnership ?? Object.fromEntries(Object.entries(baseline)
      .filter(([path]) => /\.[jt]sx?$/.test(path)).map(([path, text]) => [path, compilerOwnershipHash(text)]));
    // Shared custom components are also protected. A descriptor alone is not ownership proof.
    const customized = Object.entries(ownership).filter(([path, hash]) => !files[path] || compilerOwnershipHash(files[path]) !== hash);
    if (customized.length) {
      result.skipped.push({ pagePath, reason: `Custom renderer or component: ${customized.map(([path]) => path).join(', ')}` });
      continue;
    }
    const upgraded = compositionToReactFileSet(pageTemplate, pagePath, {
      designIntervention: { sectionVariants: [], compositionPolicy: 'maximum-compatible', envelope: design.envelope },
      enhancementCanvasBudget: Math.min(remaining, EXPERIENCE_PERFORMANCE_BUDGET.maxCanvasRootsPerPage),
    });
    const descriptorPath = resolvedCompositionPathFor(pagePath);
    const next = collectResolvedCompositions(upgraded)[pagePath];
    next.variantOverrides = { ...design.activeVariants };
    const selected = next.activation?.decisions.filter(decision => decision.reason === 'selected') ?? [];
    if (!selected.length) continue;
    const emitted = emitCompositionEnhancements(next.activation);
    const mount = '<C props={props} variantId={section.variantId} />';
    const dataBoundary = /const HYDRATABLE = new Set\([^\n]+\);/;
    if (source.split(mount).length !== 2 || !dataBoundary.test(source)) {
      result.skipped.push({ pagePath, reason: 'The compiler renderer has changed; manual replacement is required.' });
      continue;
    }
    // Patch only compiler-owned seams. Preserve canonical intent closure and
    // other sanctioned source additions that are not present in raw templates.
    const enhancedSource = `${emitted.imports}\n${source}`
      .replace(dataBoundary, line => `${line}\n${emitted.source}`)
      .replace(mount, `{enhanceSection(section, props, ${mount})}`)
      .replace('data-ut-section-id={section.id}', "data-ut-section-id={section.id}\n      className={section.type !== 'navbar' && section.type !== 'footer' ? 'relative isolate' : undefined}");
    next.compilerOwnership = { ...ownership, [pagePath]: compilerOwnershipHash(enhancedSource) };
    upgraded[descriptorPath] = JSON.stringify(next, null, 2) + '\n';
    remaining -= next.activation?.canvasRoots ?? 0;
    // The visual adapters are inline. Shared components and authored content stay byte-identical.
    result.files[pagePath] = enhancedSource;
    result.files[descriptorPath] = upgraded[descriptorPath];
    result.affected.push({ pagePath, sectionIds: [...new Set(selected.map(decision => decision.sectionId))] });
  }
  for (const path of Object.keys(files).filter(path => /^\/src\/pages\/.*\.[jt]sx$/.test(path))) {
    if (!compositions.some(composition => composition.pageFilePath === path)) result.skipped.push({ pagePath: path, reason: 'No compiler ownership record; manual replacement required.' });
  }
  return result;
}

export async function prepareCompositionUpgrade(input: Omit<CommitMutationInput, 'patch' | 'source'>): Promise<CompositionUpgradeProposal> {
  const snapshot = input.current.siteBundleSnapshot as SiteBundleSnapshot | undefined;
  if (!snapshot) throw new Error('Open a saved template project before reviewing enhancements.');
  const plan = planCompositionUpgrade(input.current.vfsFiles, snapshot);
  if (!plan.affected.length) throw new Error(plan.skipped.length ? `No safely upgradeable pages. ${plan.skipped.map(item => `${item.pagePath}: ${item.reason}`).join(' ')}` : 'This project already uses its compatible enhancements.');
  const baseVfsHash = await hashVfsFiles(input.current.vfsFiles);
  const candidate = await commitMutation({
    ...input, source: 'playground-edit', patch: emptyPatchPlan('Review richer template composition'),
    options: { ...input.options, compositionUpgrade: true, dryRun: true, requirePreviewPass: true, requireReadinessPass: false },
  });
  if (candidate.status !== 'committed') throw new Error(candidate.diagnostics.filter(item => item.level !== 'info').map(item => item.message).join('; ') || 'Enhancement validation failed.');
  // Canonical normalization must not silently undo enhancements or overwrite custom code.
  for (const { pagePath } of plan.affected) {
    const expected = plan.files[pagePath];
    const actual = candidate.vfsFiles[pagePath] || '';
    const content = (source: string) => source.match(/const SECTIONS = ([\s\S]*?);\r?\nconst HYDRATABLE/)?.[1];
    const intents = (source: string) => [...source.matchAll(/data-ut-intent=["']([^"']+)["']/g)].map(match => match[1]).sort();
    const expectedComposition = collectResolvedCompositions(plan.files)[pagePath];
    const actualComposition = collectResolvedCompositions(candidate.vfsFiles)[pagePath];
    // Preflight may normalize binding attributes. The finalized candidate is
    // what the user reviews; content, actions and selected recipes must survive.
    if (content(expected) !== content(actual) || JSON.stringify(intents(expected)) !== JSON.stringify(intents(actual))
      || !actual.includes('enhanceSection(section, props, <C props={props} variantId={section.variantId} />)')
      || JSON.stringify(expectedComposition?.activation) !== JSON.stringify(actualComposition?.activation)) {
      throw new Error(`The compiler changed the proposed content or enhancements on ${pagePath}. Keep the current project and review its composition first.`);
    }
  }
  for (const [path, source] of Object.entries(input.current.vfsFiles)) {
    if ((!path.startsWith('/src/unison/') && /\.[jt]sx?$/.test(path) || path === '/src/index.css') && plan.files[path] === source && candidate.vfsFiles[path] !== source) {
      throw new Error(`The upgrade would change an unrelated module: ${path}.`);
    }
  }
  return { ...plan, files: candidate.vfsFiles, baseVfsHash, candidate, coverage: buildCompositionCoverage(candidate.vfsFiles) };
}

export async function acceptCompositionUpgrade(proposal: CompositionUpgradeProposal, input: Omit<CommitMutationInput, 'patch' | 'source'>) {
  return commitMutation({
    ...input, source: 'playground-edit', patch: emptyPatchPlan('Accept reviewed template enhancements'),
    options: {
      ...input.options, dryRun: false, requirePreviewPass: true, requireReadinessPass: false,
      reviewedComposition: { baseVfsHash: proposal.baseVfsHash, candidate: proposal.candidate },
    },
  });
}
