import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RevisionLedgerStatus from '@/components/web-builder/RevisionLedgerStatus';

const mocks = vi.hoisted(() => ({
  evaluateDrift: vi.fn(),
  listRecentRevisionsForProject: vi.fn(),
  restoreRevision: vi.fn(),
}));

vi.mock('@/services/vfsDriftWatcher', () => ({ evaluateDrift: mocks.evaluateDrift }));
vi.mock('@/services/vfsCommitService', () => ({
  listRecentRevisionsForProject: mocks.listRecentRevisionsForProject,
  restoreRevision: mocks.restoreRevision,
}));

const revision = {
  id: 'revision-1', status: 'committed', source: 'playground',
  publishReady: false, publishBlockers: [], createdAt: '2026-09-08T00:00:00Z',
};
const identity = {
  projectId: 'project-1', draftId: 'draft-1', businessId: 'business-1',
  userId: 'user-1', sessionId: 'session-1', revisionId: 'revision-1',
};

describe('Revision ledger read-only observation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.evaluateDrift.mockResolvedValue({ reason: 'drift', revision });
    mocks.listRecentRevisionsForProject.mockResolvedValue([revision]);
    mocks.restoreRevision.mockResolvedValue({ status: 'committed', persistedRevisionId: 'revision-2' });
  });

  it('does not write when mounted or refreshed with drift', async () => {
    render(<RevisionLedgerStatus projectId="project-1" identity={identity} vfsFiles={{ '/src/App.tsx': 'unsaved edit' }} />);
    await screen.findByText('Drift');
    expect(mocks.restoreRevision).not.toHaveBeenCalled();
    fireEvent.click(screen.getByTitle('Refresh ledger status'));
    await waitFor(() => expect(mocks.evaluateDrift).toHaveBeenCalledTimes(2));
    expect(mocks.restoreRevision).not.toHaveBeenCalled();
  });

  it('restores only after an explicit history action', async () => {
    mocks.listRecentRevisionsForProject.mockResolvedValue([revision, { ...revision, id: 'revision-old' }]);
    const onRestored = vi.fn();
    render(<RevisionLedgerStatus projectId="project-1" identity={identity} vfsFiles={{}} onRestored={onRestored} />);
    await screen.findByText('Recent revisions');
    expect(mocks.restoreRevision).not.toHaveBeenCalled();
    const restore = screen.getAllByRole('button', { name: /Restore/ }).find(button => !button.hasAttribute('disabled'));
    expect(restore).toBeDefined();
    fireEvent.click(restore!);
    await waitFor(() => expect(onRestored).toHaveBeenCalledWith('revision-2'));
    expect(mocks.restoreRevision).toHaveBeenCalledExactlyOnceWith({ targetRevisionId: 'revision-old', identity });
  });
});