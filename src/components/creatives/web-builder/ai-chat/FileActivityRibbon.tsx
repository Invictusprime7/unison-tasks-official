import { useEffect, useState } from 'react';
import { CheckCircle2, CircleAlert, Loader2, FileCode, Eye } from 'lucide-react';
import { onAgentEvent, type AgentEvent } from '@/services/agent-runtime/agentEvents';
import { cn } from '@/lib/utils';

interface FileRow { path: string; added?: number; removed?: number; at: number }
type Preview = 'idle' | 'waiting' | 'updated' | 'failed';

interface Props {
  active: boolean;
  onOpenFile?: (path: string) => void;
  className?: string;
}

const shortName = (path: string) => path.split('/').filter(Boolean).slice(-2).join('/');

/**
 * Always-visible activity ribbon above the AI input: the current step,
 * every file the AI is changing (click to open it), and whether the
 * preview has re-rendered the saved edit. Read-only listener on agent events.
 */
export function FileActivityRibbon({ active, onOpenFile, className }: Props) {
  const [step, setStep] = useState<AgentEvent | null>(null);
  const [files, setFiles] = useState<FileRow[]>([]);
  const [preview, setPreview] = useState<Preview>('idle');

  useEffect(() => onAgentEvent((e, at) => {
    if (e.kind === 'file_change' && e.path) {
      setFiles((prev) => [...prev.filter((f) => f.path !== e.path), { path: e.path!, added: e.added, removed: e.removed, at }].slice(-12));
    }
    if (e.kind === 'verification' && /preview/i.test(e.message)) {
      setPreview(e.status === 'ok' ? 'updated' : 'waiting');
    } else if (e.kind === 'error' && /preview/i.test(e.message)) {
      setPreview('failed');
    }
    setStep(e);
  }), []);

  useEffect(() => {
    if (active) { setFiles([]); setStep(null); setPreview('idle'); }
  }, [active]);

  if (!active && files.length === 0 && preview === 'idle') return null;

  const stepFailed = step?.status === 'failed' || step?.kind === 'error';
  const StepIcon = !active ? CheckCircle2 : stepFailed ? CircleAlert : Loader2;

  return (
    <section aria-label="AI file activity" className={cn('border-t border-border px-3 py-2 text-xs', className)}>
      <div role="status" aria-live="polite" className="flex items-center gap-2 text-muted-foreground">
        <StepIcon aria-hidden className={cn('w-3.5 h-3.5 shrink-0', stepFailed ? 'text-destructive' : 'text-primary', active && !stepFailed && 'animate-spin motion-reduce:animate-none')} />
        <span className="truncate">{active ? (step?.message ?? 'Reading your site…') : 'Done'}</span>
        {preview !== 'idle' && (
          <span className={cn('ml-auto flex shrink-0 items-center gap-1', preview === 'failed' ? 'text-destructive' : preview === 'updated' ? 'text-primary' : 'text-muted-foreground')}>
            <Eye aria-hidden className="w-3.5 h-3.5" />
            {preview === 'updated' ? 'Preview updated' : preview === 'failed' ? 'Preview error' : 'Updating preview…'}
          </span>
        )}
      </div>
      {files.length > 0 && (
        <ol className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
          {files.map((f) => (
            <li key={f.path} className="animate-in fade-in slide-in-from-bottom-1 duration-300 motion-reduce:animate-none">
              <button
                type="button"
                onClick={() => onOpenFile?.(f.path)}
                disabled={!onOpenFile}
                title={`Open ${f.path}`}
                className="flex items-center gap-1 font-mono text-foreground underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:no-underline"
              >
                <FileCode aria-hidden className="w-3 h-3 text-muted-foreground" />
                {shortName(f.path)}
                {f.added !== undefined && <span className="text-muted-foreground">+{f.added} −{f.removed ?? 0}</span>}
              </button>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
