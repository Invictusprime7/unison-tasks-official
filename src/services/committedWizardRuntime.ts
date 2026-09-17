import type { SiteBundleSnapshot } from '@/platform/core/canonicalPipeline';
import { isSealedSnapshot } from '@/platform/core/snapshotSeal';
import {
  assertNoMinimalFallbackPreview,
  ensureSnapshotTokens,
  projectSnapshotVfsFiles,
  resolveSnapshot,
} from '@/services/snapshotProjector';
import type { LaunchState } from '@/types/launchState';

export interface CommittedWizardRuntimeInput {
  files: Record<string, string>;
  siteBundleSnapshot?: SiteBundleSnapshot | null;
  launchState?: LaunchState | null;
  snapshotVfsCompacted?: boolean;
  context?: string;
}

/**
 * Resolve a committed Wizard revision without running any legacy/template
 * normalizer. The sealed snapshot wins every overlapping runtime path and the
 * Stage 4b stylesheet is validated in place, never regenerated from a preset.
 */
export function projectCommittedWizardRuntime(
  input: CommittedWizardRuntimeInput,
): { files: Record<string, string>; snapshot: SiteBundleSnapshot } {
  const launchState = input.launchState ?? ({
    siteBundleSnapshot: input.siteBundleSnapshot ?? undefined,
    snapshotVfsCompacted: input.snapshotVfsCompacted,
  } as unknown as LaunchState);
  const resolution = resolveSnapshot(input.files, launchState);
  const context = input.context || 'Committed Wizard runtime';

  if (!resolution.isWizardDraft || !resolution.snapshot || !isSealedSnapshot(resolution.snapshot)) {
    throw new Error(`[${context}] requires a sealed SiteBundleSnapshot.`);
  }

  const files = projectSnapshotVfsFiles(input.files, resolution);
  // Validation only: ensureSnapshotTokens returns the existing Stage 4b CSS
  // unchanged or throws. Never assign a synthesized replacement here.
  ensureSnapshotTokens(files['/src/index.css'], resolution);
  assertNoMinimalFallbackPreview(files, resolution, context);

  return { files, snapshot: resolution.snapshot };
}
