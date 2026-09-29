import { describe, expect, it } from 'vitest';
import { buildFileProvenance, stampAcceptedRevision } from '@/services/fileProvenance';

describe('canonical file provenance', () => {
  it('retains unchanged authorship and records changed, created and deleted files', async () => {
    const previousFiles = {
      '/src/App.tsx': 'accepted app',
      '/src/hooks/useData.ts': 'accepted hook',
      '/src/removed.ts': 'remove me',
    };
    const previousProvenance = await buildFileProvenance({
      previousFiles: {}, files: previousFiles, source: 'wizard-launch',
      operationIds: ['launch-1'], candidateId: 'candidate-launch',
      compilerOwnedPaths: [],
    });
    const acceptedPrevious = stampAcceptedRevision(previousProvenance, 'revision-1');

    const next = await buildFileProvenance({
      previousFiles,
      files: {
        '/src/App.tsx': 'edited app',
        '/src/hooks/useData.ts': 'accepted hook',
        '/src/new.ts': 'new file',
      },
      previousProvenance: acceptedPrevious,
      parentRevisionId: 'revision-1',
      source: 'playground-edit',
      operationIds: ['operation-2'],
      candidateId: null,
      compilerOwnedPaths: [],
    });

    expect(next['/src/hooks/useData.ts']).toEqual(acceptedPrevious['/src/hooks/useData.ts']);
    expect(next['/src/App.tsx']).toMatchObject({
      creatorOrigin: 'wizard-launch', lastEditorOrigin: 'playground-edit', ownership: 'user',
      candidateId: null, lastOperationIds: ['operation-2'], authoredRevisionId: null, deleted: false,
    });
    expect(next['/src/App.tsx'].priorHash).toMatch(/^sha256:|^fnv1a:/);
    expect(next['/src/App.tsx'].currentHash).not.toBe(next['/src/App.tsx'].priorHash);
    expect(next['/src/new.ts']).toMatchObject({ creatorOrigin: 'playground-edit', ownership: 'user', priorHash: null });
    expect(next['/src/removed.ts']).toMatchObject({ currentHash: null, deleted: true, authoredRevisionId: null });
  });

  it('uses explicit compiler ownership instead of filename conventions', async () => {
    const provenance = await buildFileProvenance({
      previousFiles: {},
      files: {
        '/src/components/Hero.tsx': 'user hero',
        '/src/unison/ui/Button.tsx': 'generated button',
      },
      source: 'wizard-launch',
      operationIds: ['launch'],
      compilerOwnedPaths: ['/src/unison/**'],
    });

    expect(provenance['/src/components/Hero.tsx'].ownership).toBe('ai');
    expect(provenance['/src/unison/ui/Button.tsx'].ownership).toBe('compiler');
  });
});
