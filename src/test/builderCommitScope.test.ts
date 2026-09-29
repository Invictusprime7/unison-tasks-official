import { describe, expect, it } from 'vitest';
import { isActiveBuilderCommitScope } from '@/services/builderCommitScope';

describe('builder commit scope', () => {
  it('accepts only the project and draft that started the commit', () => {
    const captured = { projectId: 'project-a', draftId: 'draft-a' };
    expect(isActiveBuilderCommitScope(captured, captured)).toBe(true);
    expect(isActiveBuilderCommitScope({ projectId: 'project-b', draftId: 'draft-a' }, captured)).toBe(false);
    expect(isActiveBuilderCommitScope({ projectId: 'project-a', draftId: 'draft-b' }, captured)).toBe(false);
  });

  it('never treats unresolved identity as an active commit scope', () => {
    expect(isActiveBuilderCommitScope(
      { projectId: 'project-a', draftId: 'draft-a' },
      { projectId: null, draftId: 'draft-a' },
    )).toBe(false);
  });
});
