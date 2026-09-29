import { supabase } from '@/integrations/supabase/client';

export interface ConfirmedLaunchIds {
  businessId: string;
  siteId: string;
  projectId: string;
  draftId: string;
  buildId: string;
  bundleId: string;
}

export interface ConfirmedLaunchProvisionInput {
  ids: ConfirmedLaunchIds;
  existingBusinessId?: string | null;
  businessName: string;
  industry: string;
  siteName: string;
  siteSlug?: string | null;
  systemType: string;
  templateId?: string | null;
  themePresetId: string;
}

export function createConfirmedLaunchIds(existingBusinessId?: string | null): ConfirmedLaunchIds {
  return {
    businessId: existingBusinessId || crypto.randomUUID(),
    siteId: crypto.randomUUID(),
    projectId: crypto.randomUUID(),
    draftId: crypto.randomUUID(),
    buildId: crypto.randomUUID(),
    bundleId: crypto.randomUUID(),
  };
}

const SCHEMA_CACHE_RETRY_DELAYS_MS = [250, 750, 1_500] as const;

function isTransientSchemaCacheError(error: unknown): boolean {
  const message = error instanceof Error
    ? error.message
    : typeof error === 'object' && error !== null && 'message' in error
      ? String((error as { message?: unknown }).message || '')
      : String(error || '');
  return /schema cache|could not query the database/i.test(message);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => globalThis.setTimeout(resolve, ms));
}

export async function provisionConfirmedLaunchSite(
  input: ConfirmedLaunchProvisionInput,
): Promise<ConfirmedLaunchIds> {
  const { data, error } = await supabase.functions.invoke('provision-launch-site', {
    body: input,
  });
  if (error) throw new Error(error.message || 'Unable to provision the confirmed site launch.');

  const result = (data as { data?: Partial<ConfirmedLaunchIds> } | null)?.data;
  if (!result?.businessId || !result.siteId || !result.projectId || !result.draftId || !result.buildId || !result.bundleId) {
    throw new Error('Confirmed launch provisioning returned an incomplete site identity.');
  }

  // Provisioning owns identity only. Any site content present before the
  // platform-core commit would create a competing source of truth. The edge
  // function inserts this shell atomically through Postgres; this REST read is
  // a verification step and must not turn a completed launch into a failure
  // while PostgREST is refreshing its schema cache.
  let draftRow: {
    id: string;
    project_id: string;
    business_id: string;
    site_id: string;
    last_revision_id: string | null;
    vfs_files: unknown;
    metadata: unknown;
  } | null = null;
  let verificationUnavailable = false;
  for (let attempt = 0; attempt <= SCHEMA_CACHE_RETRY_DELAYS_MS.length; attempt += 1) {
    const { data: candidate, error: verifyError } = await supabase
      .from('builder_drafts')
      .select('id, project_id, business_id, site_id, last_revision_id, vfs_files, metadata')
      .eq('id', result.draftId)
      .maybeSingle();
    if (!verifyError) {
      draftRow = candidate;
      break;
    }
    if (!isTransientSchemaCacheError(verifyError)) {
      throw new Error(`Launch persisted but could not be verified: ${verifyError.message}`);
    }
    if (attempt === SCHEMA_CACHE_RETRY_DELAYS_MS.length) {
      verificationUnavailable = true;
      break;
    }
    await delay(SCHEMA_CACHE_RETRY_DELAYS_MS[attempt]);
  }
  if (verificationUnavailable) return result as ConfirmedLaunchIds;
  if (!draftRow
    || draftRow.project_id !== result.projectId
    || draftRow.business_id !== result.businessId
    || draftRow.site_id !== result.siteId) {
    throw new Error('Confirmed launch shell identity could not be verified.');
  }
  const persistedFiles = (draftRow.vfs_files ?? {}) as Record<string, unknown>;
  const persistedMetadata = draftRow.metadata && typeof draftRow.metadata === 'object'
    ? draftRow.metadata as Record<string, unknown>
    : {};
  if (draftRow.last_revision_id !== null
    || Object.keys(persistedFiles).length > 0
    || persistedMetadata.siteBundleSnapshot !== undefined
    || persistedMetadata.runtimeManifest !== undefined) {
    throw new Error('Confirmed launch shell contains content outside the canonical commit pipeline.');
  }

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user?.id) {
    throw new Error('Confirmed launch project ownership could not be verified.');
  }
  const { data: membership, error: membershipError } = await supabase
    .from('project_members')
    .select('id')
    .eq('project_id', result.projectId)
    .eq('user_id', authData.user.id)
    .maybeSingle();
  if (membershipError || !membership) {
    throw new Error('Confirmed launch project ownership could not be verified.');
  }
  return result as ConfirmedLaunchIds;
}
