import { supabase } from '@/integrations/supabase/client';
import type { GeneratedSitePlan } from '@/platform/core/siteTopologyPlanner';
import { readBuilderRecoverySnapshot, type BuilderRecoverySnapshot } from './builderStateRecovery';

const record = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
/** Both persisted string maps and Sandpack's { code } file descriptors are VFS input. */
export const savedVfsFilesFrom = (value: unknown): Record<string, string> => Object.fromEntries(
  Object.entries(record(value)).flatMap(([path, entry]) => {
    const source = typeof entry === 'string' ? entry : record(entry).code;
    return typeof source === 'string' ? [[`/${path.replace(/\\/g, '/').replace(/^\/+/, '')}`, source]] : [];
  }),
);

export function resolveScopedDraftRecovery(draftId: string, recovery: BuilderRecoverySnapshot | null) {
  if (!recovery || recovery.templateId !== draftId) return null;
  const content = resolveLegacyDraftContent({ vfs_files: recovery.vfsFiles, editor_code: recovery.editorCode, code: recovery.code });
  return content.hasContent ? content : null;
}

export function resolveScopedSavedTemplate(draftId: string, templates: unknown) {
  if (!Array.isArray(templates)) return null;
  const template = templates.map(record).find((item) => item.id === draftId || record(item.canvas_data).draftId === draftId);
  if (!template) return null;
  const canvas = record(template.canvas_data);
  const content = resolveLegacyDraftContent({ vfsFiles: canvas.vfsFiles, editor_code: canvas.previewCode,
    code: canvas.html, metadata: canvas });
  return content.hasContent ? content : null;
}

function readSavedTemplateRecovery(draftId: string) {
  try { return resolveScopedSavedTemplate(draftId, JSON.parse(localStorage.getItem('webbuilder_templates') ?? '[]')); }
  catch { return null; }
}

/** Resolve saved source or the historical declarative save format without writing it. */
export function resolveLegacyDraftContent(row: {
  code?: unknown; editor_code?: unknown; vfs_files?: unknown; vfsFiles?: unknown; metadata?: unknown;
}) {
  const metadata = record(row.metadata);
  const snapshot = record(metadata.siteBundleSnapshot);
  const candidates = [row.vfs_files, row.vfsFiles, metadata.vfsFiles, snapshot.vfsFiles];
  const files = candidates.map(savedVfsFilesFrom).find((candidate) => Object.values(candidate).some((source) => source.trim())) ?? {};
  const code = [row.editor_code, row.code].find((source): source is string => typeof source === 'string' && !!source.trim()
    && !source.includes('AI-generated code will appear here')) ?? '';
  const savedPlan = record(metadata.sitePlan);
  const sitePlan = Array.isArray(savedPlan.pages) && savedPlan.pages.length > 0
    && typeof savedPlan.businessName === 'string'
    ? savedPlan as unknown as GeneratedSitePlan : null;
  return { files, code, activePagePath: typeof metadata.activePagePath === 'string' ? metadata.activePagePath : undefined,
    sitePlan, hasContent: Object.values(files).some((source) => source.trim()) || !!code || !!sitePlan };
}

/** Compatibility projection for old declarative saves, never fresh launch authorship. */
export async function projectLegacySavedPlan(plan: GeneratedSitePlan, identity?: { businessId?: string | null; projectId?: string; siteId?: string | null }) {
  const { getCompositionById } = await import('@/sections/templates');
  const template = getCompositionById(plan.selectedTemplateId!);
  if (!template) throw new Error(`Saved project template "${plan.selectedTemplateId}" is unavailable. The project is not empty.`);
  const { generateTopologyPlaceholderFiles } = await import('@/utils/topologyVFSScaffolder');
  const { populateRegistryFromTopology } = await import('@/platform/core/siteTopologyPlanner');
  const { patchVFS } = await import('./unifiedPreviewPipeline');
  const { ensureViteRootFiles } = await import('./previewSession');
  const { buildThemedIndexCss, buildThemedIndexCssFromTokens } = await import('@/components/onboarding/themePresetToIndexCss');
  const { THEME_PRESETS } = await import('@/components/onboarding/themePresets');
  const { ensureGeneratedUiFoundation } = await import('@/platform/core/generatedUiFoundation');
  const { buildPublishedRuntimeConfig, buildPublishedRuntimeModule, buildGeneratedSiteRuntimeManifestModule,
    PUBLISHED_RUNTIME_MODULE_PATH, GENERATED_SITE_RUNTIME_MANIFEST_MODULE_PATH } = await import('./canonicalLaunchVfs');
  const { compileGeneratedSiteRuntimeManifest } = await import('./generatedSiteRuntimeManifest');
  const files: Record<string, string> = {};
  const preset = THEME_PRESETS.find((candidate) => candidate.id === plan.selectedThemePresetId);
  if (!preset && !template.theme) throw new Error('Saved project has no available template theme. The project is not empty.');
  files['/src/index.css'] = preset ? buildThemedIndexCss(preset, { industry: plan.industry })
    : buildThemedIndexCssFromTokens(template.theme!, { industry: plan.industry });
  for (const page of plan.pages) Object.assign(files, generateTopologyPlaceholderFiles(page, plan, template));
  const siteId = identity?.siteId || plan.siteId;
  files[PUBLISHED_RUNTIME_MODULE_PATH] = buildPublishedRuntimeModule(buildPublishedRuntimeConfig({ ...identity, siteId }));
  files[GENERATED_SITE_RUNTIME_MANIFEST_MODULE_PATH] = buildGeneratedSiteRuntimeManifestModule(compileGeneratedSiteRuntimeManifest({ siteId }));
  const pageRegistry = populateRegistryFromTopology(plan);
  const foundation = ensureGeneratedUiFoundation(files, { industry: plan.industry, templateId: plan.selectedTemplateId, themePresetId: plan.selectedThemePresetId });
  return { files: ensureViteRootFiles(patchVFS(foundation.files, pageRegistry, plan.businessName)), pageRegistry };
}

export async function loadLegacyDraftContent(projectId: string, draftId: string) {
  const { data, error } = await supabase.from('builder_drafts')
    .select('code, editor_code, vfs_files, metadata, last_revision_id, business_id, site_id')
    .eq('id', draftId).eq('project_id', projectId).maybeSingle();
  if (error) throw error;
  // A canonical revision pointer can never be bypassed by legacy source.
  if (!data || data.last_revision_id) return null;
  const content = resolveLegacyDraftContent(data);
  if (!Object.keys(content.files).length && !content.code) {
    // The cloud row must first be accessible and have no accepted revision.
    // A scoped browser journal can recover an interrupted pre-revision save.
    const recovered = resolveScopedDraftRecovery(draftId, readBuilderRecoverySnapshot(draftId)) ?? readSavedTemplateRecovery(draftId);
    if (recovered) return { ...recovered, pageRegistry: undefined };
    const metadata = record(data.metadata);
    const siteId = data.site_id || metadata.siteId;
    if (typeof metadata.siteBundleId === 'string' && typeof siteId === 'string') {
      const { data: savedBundle, error: bundleError } = await supabase.from('site_bundles')
        .select('bundle').eq('id', metadata.siteBundleId).eq('site_id', siteId).maybeSingle();
      if (bundleError) throw bundleError;
      const bundleContent = resolveLegacyDraftContent({ metadata: { siteBundleSnapshot: savedBundle?.bundle } });
      if (bundleContent.hasContent) return { ...bundleContent, pageRegistry: undefined };
    }
    if (!content.hasContent && (metadata.siteBundleId || metadata.siteBuildId)) {
      throw new Error('This saved project has no recoverable source in its draft. Its saved build/bundle reference is unavailable; a browser recovery copy or source backup is needed.');
    }
  }
  if (!content.hasContent) return null;
  if (!Object.keys(content.files).length && !content.code && content.sitePlan) {
    return { ...content, ...await projectLegacySavedPlan(content.sitePlan, { projectId, businessId: data.business_id, siteId: data.site_id }) };
  }
  return { ...content, pageRegistry: undefined };
}
