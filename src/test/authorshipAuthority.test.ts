import { describe, expect, it } from 'vitest';
import {
  assertCreativeAuthority,
  authorityAfterAcceptedCommit,
  deriveAuthorshipAuthority,
} from '@/services/authorshipAuthority';

describe('authorship authority lifecycle', () => {
  it('hands creative authority to Builder after the accepted launch revision', () => {
    const before = deriveAuthorshipAuthority({ acceptedRevisionId: null });
    expect(before).toEqual({
      phase: 'wizard-launch', creativeAuthority: 'wizard', commitAuthority: 'vfs-commit-service',
    });

    expect(authorityAfterAcceptedCommit(before, 'wizard-launch', 'revision-1')).toEqual({
      phase: 'builder-authoring', creativeAuthority: 'builder',
      commitAuthority: 'vfs-commit-service', launchRevisionId: 'revision-1',
    });
  });

  it('rejects an implicit return to Wizard authority after handoff', () => {
    const authority = {
      phase: 'builder-authoring' as const,
      creativeAuthority: 'builder' as const,
      commitAuthority: 'vfs-commit-service' as const,
      launchRevisionId: 'revision-1',
    };
    expect(() => assertCreativeAuthority({ source: 'wizard-launch', authority }))
      .toThrow('explicit regeneration/reset');
    expect(() => assertCreativeAuthority({ source: 'wizard-launch', authority, explicitReset: true }))
      .not.toThrow();
    expect(() => assertCreativeAuthority({ source: 'ai-builder', authority })).not.toThrow();
  });
});
