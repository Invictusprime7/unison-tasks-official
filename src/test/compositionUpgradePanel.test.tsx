import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CompositionUpgradePanel from '@/components/web-builder/CompositionUpgradePanel';
import { prepareCompositionUpgrade, acceptCompositionUpgrade } from '@/services/compositionUpgrade';
import type { CommitMutationInput } from '@/services/vfsCommitService';
import { isScratchPreviewMessage } from '@/utils/scratchPreview';

vi.mock('@/components/VFSPreview', () => ({ VFSPreview: ({ onReady, onError }: { onReady: () => void; onError: (message: string) => void }) =>
  <div><button onClick={onReady}>Preview loaded</button><button onClick={() => onError('Missing export')}>Preview failed</button></div>,
}));
vi.mock('@/services/compositionUpgrade', () => ({ prepareCompositionUpgrade: vi.fn(), acceptCompositionUpgrade: vi.fn() }));
vi.mock('@/services/vfsCommitService', () => ({ restoreRevision: vi.fn() }));
vi.mock('@/services/compositionCoverage', () => ({ buildCompositionCoverage: vi.fn() }));
const input = { identity: { projectId: 'project-one', revisionId: 'one' }, current: { vfsFiles: {} } } as CommitMutationInput;
const proposal = { affected: [{ pagePath: '/src/pages/Home.tsx', sectionIds: ['hero'] }], skipped: [], files: {} };
beforeEach(() => { vi.resetAllMocks(); vi.mocked(prepareCompositionUpgrade).mockResolvedValue(proposal as never); });
afterEach(cleanup);

describe('composition upgrade review', () => {
  it('isolates messages from open and detached scratch frames', () => {
    const wrapper = document.createElement('div');
    wrapper.dataset.compositionScratch = '';
    const frame = document.createElement('iframe'); wrapper.append(frame); document.body.append(wrapper);
    const event = new MessageEvent('message', { source: frame.contentWindow, data: { type: 'INTENT_TRIGGER' } });
    expect(isScratchPreviewMessage(event)).toBe(true);
    wrapper.remove();
    expect(isScratchPreviewMessage(event)).toBe(true);
    expect(isScratchPreviewMessage(new MessageEvent('message', { source: window }))).toBe(false);
  });
  it('waits for the scratch preview and uses fresh project state on acceptance', async () => {
    let current = input;
    const committed = vi.fn();
    vi.mocked(acceptCompositionUpgrade).mockResolvedValue({ status: 'committed', parentRevisionId: 'one', persistedRevisionId: 'three' } as never);
    render(<CompositionUpgradePanel projectKey="one" getInput={() => current} onCommitted={committed} />);
    fireEvent.click(screen.getByText('Review enhancements'));
    await screen.findByText('Preview loaded');
    expect(screen.getByText('Apply enhancements')).toBeDisabled();
    fireEvent.click(screen.getByText('Preview loaded'));
    current = { ...input, identity: { ...input.identity, revisionId: 'two' } };
    fireEvent.click(screen.getByText('Apply enhancements'));
    await waitFor(() => expect(committed).toHaveBeenCalledOnce());
    expect(acceptCompositionUpgrade).toHaveBeenCalledWith(proposal, current);
    expect(screen.getByText('Undo enhancement')).toBeInTheDocument();
  });
  it('keeps the working project when scratch validation fails', async () => {
    const committed = vi.fn();
    render(<CompositionUpgradePanel projectKey="one" getInput={() => input} onCommitted={committed} />);
    fireEvent.click(screen.getByText('Review enhancements'));
    await screen.findByText('Preview failed');
    fireEvent.click(screen.getByText('Preview loaded'));
    fireEvent.click(screen.getByText('Preview failed'));
    expect(screen.getByRole('alert')).toHaveTextContent('Missing export');
    expect(screen.getByText('Apply enhancements')).toBeDisabled();
    expect(committed).not.toHaveBeenCalled();
    expect(acceptCompositionUpgrade).not.toHaveBeenCalled();
  });
  it('discards a proposal that finishes after switching projects', async () => {
    let finish!: (value: never) => void;
    vi.mocked(prepareCompositionUpgrade).mockReturnValue(new Promise(resolve => { finish = resolve; }));
    const committed = vi.fn();
    const view = render(<CompositionUpgradePanel projectKey="one" getInput={() => input} onCommitted={committed} />);
    fireEvent.click(screen.getByText('Review enhancements'));
    view.rerender(<CompositionUpgradePanel projectKey="two" getInput={() => input} onCommitted={committed} />);
    await act(async () => finish(proposal as never));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(committed).not.toHaveBeenCalled();
  });
});
