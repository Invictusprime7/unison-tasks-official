import type { SiteBundleSnapshot } from '@/platform/core/canonicalPipeline';
import type { PatchSource } from '@/types/patchPlan';

export type VfsAuthorshipPhase = 'wizard-launch' | 'builder-authoring';

export interface AuthorshipAuthority {
  phase: VfsAuthorshipPhase;
  creativeAuthority: 'wizard' | 'builder';
  commitAuthority: 'vfs-commit-service';
  launchRevisionId?: string;
}

export function deriveAuthorshipAuthority(input: {
  snapshot?: SiteBundleSnapshot | null;
  acceptedRevisionId?: string | null;
}): AuthorshipAuthority {
  const recorded = input.snapshot?.meta.authorshipAuthority;
  if (recorded?.commitAuthority === 'vfs-commit-service'
    && ((recorded.phase === 'wizard-launch' && recorded.creativeAuthority === 'wizard')
      || (recorded.phase === 'builder-authoring' && recorded.creativeAuthority === 'builder'))) {
    return { ...recorded };
  }
  if (input.acceptedRevisionId) {
    return {
      phase: 'builder-authoring',
      creativeAuthority: 'builder',
      commitAuthority: 'vfs-commit-service',
    };
  }
  return {
    phase: 'wizard-launch',
    creativeAuthority: 'wizard',
    commitAuthority: 'vfs-commit-service',
  };
}

export function assertCreativeAuthority(input: {
  source: PatchSource;
  authority: AuthorshipAuthority;
  explicitReset?: boolean;
}): void {
  if (input.source === 'wizard-launch'
    && input.authority.phase === 'builder-authoring'
    && input.explicitReset !== true) {
    throw new Error(
      '[AuthorshipAuthority] Wizard creative authority ended at launch commit. An explicit regeneration/reset is required.',
    );
  }
}

export function authorityAfterAcceptedCommit(
  current: AuthorshipAuthority,
  source: PatchSource,
  acceptedRevisionId?: string | null,
): AuthorshipAuthority {
  if (source === 'wizard-launch') {
    return {
      phase: 'builder-authoring',
      creativeAuthority: 'builder',
      commitAuthority: 'vfs-commit-service',
      ...(acceptedRevisionId ? { launchRevisionId: acceptedRevisionId } : {}),
    };
  }
  return current.phase === 'builder-authoring'
    ? { ...current }
    : {
        phase: 'builder-authoring',
        creativeAuthority: 'builder',
        commitAuthority: 'vfs-commit-service',
        ...(current.launchRevisionId ? { launchRevisionId: current.launchRevisionId } : {}),
      };
}

export function stampSnapshotAuthority(
  snapshot: SiteBundleSnapshot,
  authority: AuthorshipAuthority,
): SiteBundleSnapshot {
  return { ...snapshot, meta: { ...snapshot.meta, authorshipAuthority: { ...authority } } };
}
