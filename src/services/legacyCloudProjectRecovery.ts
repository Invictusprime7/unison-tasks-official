import { supabase } from '@/integrations/supabase/client';
import { resolveLegacyDraftContent, projectLegacySavedPlan } from './legacyDraftHydration';
import { computeBuilderVfsSignature, readBuilderRecoverySnapshot, writeBuilderRecoverySnapshot } from './builderStateRecovery';
import { planSiteTopology, resolvePageSpecsForRoles } from '@/platform/core/siteTopologyPlanner';
import type { PlaygroundPageRole } from '@/types/playground';

const record = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};

/** Explicit legacy conversion only: preserve source, or rebuild recorded selections. */
export async function recoverLegacyCloudProject(projectId: string): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Sign in to recover your cloud project.');
  const { data: project, error } = await supabase.from('projects').select('id, owner_id, business_id, name, settings').eq('id', projectId).eq('owner_id', user.id).maybeSingle();
  if (error) throw error;
  if (!project || !project.business_id) throw new Error('Project ownership or owning workspace is unavailable.');
  const { data: draft, error: draftError } = await supabase.from('builder_drafts').select('*').eq('project_id', projectId).eq('user_id', user.id).order('updated_at', { ascending: false }).limit(1).maybeSingle();
  if (draftError) throw draftError;
  if (draft && (draft.last_revision_id || resolveLegacyDraftContent(draft).hasContent || Object.keys(readBuilderRecoverySnapshot(draft.id)?.vfsFiles || {}).length)) return draft.id;
  const settings = record(project.settings);
  if (typeof settings.siteId !== 'string') throw new Error('No saved source or launch identity is available.');
  const { data: bundles, error: bundleError } = await supabase.from('site_bundles').select('bundle').eq('site_id', settings.siteId).order('created_at', { ascending: false }).limit(1);
  if (bundleError) throw bundleError;
  let files = resolveLegacyDraftContent({ metadata: { siteBundleSnapshot: bundles?.[0]?.bundle } }).files;
  let reconstruction: Record<string, unknown> = {};
  if (!Object.keys(files).length) {
    const { data: build, error: buildError } = await supabase.from('site_builds').select('context').eq('site_id', settings.siteId).order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (buildError) throw buildError;
    const context = record(build?.context);
    const selections = record(context.wizardSelections);
    if (typeof context.templateId !== 'string' || typeof context.industry !== 'string' || typeof context.themePresetId !== 'string') throw new Error('Original source and complete saved composition selections are unavailable.');
    const pages = Array.isArray(selections.requestedPages) ? selections.requestedPages.filter((page): page is string => typeof page === 'string') : [];
    if (!pages.length) throw new Error('Saved page selections are unavailable; refusing to substitute default pages.');
    const plan = planSiteTopology(context.industry, typeof selections.businessName === 'string' ? selections.businessName : project.name, {
      selectedTemplateId: context.templateId, selectedThemePresetId: context.themePresetId,
      primaryIntent: typeof selections.primaryIntent === 'string' ? selections.primaryIntent : undefined,
      additionalPages: resolvePageSpecsForRoles(pages as PlaygroundPageRole[], context.industry), restrictToAdditionalPages: true,
    });
    const projected = await projectLegacySavedPlan(plan, { projectId, businessId: project.business_id, siteId: settings.siteId });
    files = projected.files;
    files['/.unison/canonical-playground.json'] = JSON.stringify({ pageRegistry: projected.pageRegistry });
    files['/.unison/legacy-theme.json'] = JSON.stringify({ themePresetId: context.themePresetId, themeTokens: selections.themeTokens });
    reconstruction = { recoveryKind: 'recomposed-from-saved-selections', originalSourceRecovered: false, templateId: context.templateId, themePresetId: context.themePresetId, industry: context.industry, businessName: plan.businessName };
    files['/.unison/legacy-recovery.json'] = JSON.stringify(reconstruction, null, 2);
  }
  let draftId = draft?.id;
  if (!draftId) {
    const { data: inserted, error: insertError } = await supabase.from('builder_drafts').insert({ user_id: user.id, project_id: projectId, business_id: project.business_id, name: project.name, metadata: { name: project.name, projectId, siteId: settings.siteId, ...reconstruction } }).select('id').single();
    if (insertError) throw insertError;
    draftId = inserted.id;
  }
  if (!writeBuilderRecoverySnapshot({ version: 2, templateId: draftId, code: '', editorCode: '', savedAt: new Date().toISOString(), vfsSignature: computeBuilderVfsSignature(files), vfsFiles: files, pendingRemote: true, reason: 'ai_recovery' })) throw new Error('Recovery storage is unavailable; source was not committed.');
  return draftId;
}
