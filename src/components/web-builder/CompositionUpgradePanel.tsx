import { useEffect, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';
import { VFSPreview } from '@/components/VFSPreview';
import { prepareCompositionUpgrade, acceptCompositionUpgrade, type CompositionUpgradeProposal } from '@/services/compositionUpgrade';
import { buildCompositionCoverage } from '@/services/compositionCoverage';
import { restoreRevision, type CommitMutationInput, type CommitMutationResult } from '@/services/vfsCommitService';

type UpgradeInput = Omit<CommitMutationInput, 'patch' | 'source'>;
interface Props {
  projectKey: string;
  getInput: () => UpgradeInput | null;
  onCommitted: (result: CommitMutationResult) => void;
}

export default function CompositionUpgradePanel({ projectKey, getInput, onCommitted }: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [proposal, setProposal] = useState<CompositionUpgradeProposal | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rollback, setRollback] = useState<{ target: string; accepted: string } | null>(null);
  const generation = useRef(0);
  const latestKey = useRef(projectKey);
  latestKey.current = projectKey;
  useEffect(() => {
    generation.current++;
    setOpen(false); setProposal(null); setReady(false); setError(null); setRollback(null); setBusy(false);
    return () => { generation.current++; };
  }, [projectKey]);

  async function review() {
    const input = getInput();
    if (!input) { setError('Open a saved project to review enhancements.'); return; }
    const request = ++generation.current;
    setBusy(true); setError(null); setReady(false); setProposal(null); setOpen(true);
    try {
      const result = await prepareCompositionUpgrade(input);
      if (request === generation.current) setProposal(result);
    } catch (err) {
      if (request === generation.current) setError(err instanceof Error ? err.message : String(err));
    } finally { if (request === generation.current) setBusy(false); }
  }

  async function accept() {
    const input = getInput();
    if (!proposal || !ready || !input || busy) return;
    const key = latestKey.current;
    setBusy(true); setError(null);
    try {
      const result = await acceptCompositionUpgrade(proposal, input);
      if (key !== latestKey.current) return;
      if (result.status !== 'committed') throw new Error('The enhancement failed validation. Your current preview is unchanged.');
      setRollback(result.parentRevisionId && result.persistedRevisionId ? { target: result.parentRevisionId, accepted: result.persistedRevisionId } : null);
      setOpen(false); setProposal(null);
      onCommitted(result);
    } catch (err) { if (key === latestKey.current) setError(err instanceof Error ? err.message : String(err)); }
    finally { if (key === latestKey.current) setBusy(false); }
  }

  async function undo() {
    const input = getInput();
    if (!input || !rollback || busy) return;
    if (input.identity.revisionId !== rollback.accepted) {
      setError('The project changed after this enhancement. Review a restore in revision history to preserve your later edits.');
      return;
    }
    const key = latestKey.current;
    setBusy(true); setError(null);
    try {
      const result = await restoreRevision({ targetRevisionId: rollback.target, identity: input.identity });
      if (key !== latestKey.current) return;
      if (result.status !== 'committed') throw new Error('Restore validation failed. Use revision history to review the previous version.');
      onCommitted(result); setRollback(null);
    } catch (err) { if (key === latestKey.current) setError(err instanceof Error ? err.message : String(err)); }
    finally { if (key === latestKey.current) setBusy(false); }
  }

  function downloadCoverage() {
    const input = getInput();
    if (!input) return;
    const report = proposal?.coverage ?? buildCompositionCoverage(input.current.vfsFiles);
    const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = 'template-composition-coverage.json'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return <section className="rounded-lg border p-3 space-y-3" aria-label="Template enhancements">
    <h3 className="font-medium">Template enhancements</h3>
    <p className="text-sm text-muted-foreground">Review compatible visual enhancements for this project. Previous versions remain in revision history.</p>
    <div className="flex flex-wrap gap-2">
      <Button size="sm" onClick={() => void review()} disabled={busy}>Review enhancements</Button>
      <Button size="sm" variant="outline" onClick={downloadCoverage}>Download coverage</Button>
      {rollback && <Button size="sm" variant="outline" disabled={busy} onClick={() => void undo()}>Undo enhancement</Button>}
    </div>
    {!open && error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <Dialog.Root open={open} onOpenChange={next => { if (!busy) { setOpen(next); if (!next) { generation.current++; setProposal(null); } } }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70" />
        <Dialog.Content className="fixed inset-4 z-50 flex flex-col gap-3 overflow-auto rounded-lg border bg-background p-5 shadow-xl" aria-busy={busy}>
          <Dialog.Title className="text-lg font-semibold">Review template enhancements</Dialog.Title>
          <Dialog.Description className="text-sm text-muted-foreground">Check the proposed appearance before applying it to your project. Custom renderers are listed for manual review.</Dialog.Description>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          {busy && !proposal && <p role="status">Preparing and validating your preview…</p>}
          {proposal && <>
            <div className="max-h-28 overflow-auto text-sm">
              {proposal.affected.map(page => <p key={page.pagePath}>
                {page.pagePath.replace('/src/pages/', '').replace(/\.[jt]sx$/, '')}: {page.sectionIds.map(id =>
                  proposal.coverage?.pages.find(item => item.pagePath === page.pagePath)?.selectedImplementations.find(section => section.sectionId === id)?.primitiveId || id
                ).join(', ')}
              </p>)}
              {proposal.skipped.map(page => <p key={page.pagePath} className="text-muted-foreground">{page.pagePath}: {page.reason}</p>)}
            </div>
            <div data-composition-scratch className="min-h-80 flex-1">
              <VFSPreview nodes={[]} files={proposal.files} showToolbar={false} showConsole={false} enableSelection={false}
                onReady={() => setReady(true)} onError={message => { setError(message); setReady(false); }} />
            </div>
          </>}
          <div className="flex justify-end gap-2">
            <Dialog.Close asChild><Button variant="outline" disabled={busy}>Cancel</Button></Dialog.Close>
            <Button disabled={!proposal || !ready || busy || Boolean(error)} onClick={() => void accept()}>Apply enhancements</Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  </section>;
}
