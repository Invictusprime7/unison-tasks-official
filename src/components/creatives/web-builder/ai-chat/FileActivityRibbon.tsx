import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, CircleAlert, Loader2, FileCode, Eye, ChevronDown } from 'lucide-react';
import { onAgentEvent, type AgentEvent } from '@/services/agent-runtime/agentEvents';
import { cn } from '@/lib/utils';

interface StepRow { key: string; event: AgentEvent; at: number }
type Preview = 'idle' | 'waiting' | 'updated' | 'failed';

interface Props {
  active: boolean;
  onOpenFile?: (path: string) => void;
  className?: string;
}

const shortName = (path: string) => path.split('/').filter(Boolean).slice(-2).join('/');

/**
 * Live, cascading activity feed above the AI input (chat-agent style):
 * a "Working for Ns" header with a running timer, then every step the AI
 * takes — reading, writing, each edited file (click to open), saving and
 * preview updates. Read-only listener on agent events.
 */
export function FileActivityRibbon({ active, onOpenFile, className }: Props) {
  const [steps, setSteps] = useState<StepRow[]>([]);
  const [preview, setPreview] = useState<Preview>('idle');
  const [open, setOpen] = useState(true);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [finishedAt, setFinishedAt] = useState<number | null>(null);
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => onAgentEvent((e, at) => {
    if (e.kind === 'verification' && /preview/i.test(e.message)) {
      setPreview(e.status === 'ok' ? 'updated' : 'waiting');
      return;
    }
    if (e.kind === 'error' && /preview/i.test(e.message)) { setPreview('failed'); return; }
    // File rows and "writing" steps update in place instead of piling up.
    const key = e.kind === 'file_change' && e.path ? `file:${e.path}` : e.kind === 'plan' ? 'plan' : `${e.kind}:${at}`;
    setSteps((prev) => {
      const next = prev.filter((s) => s.key !== key);
      // Once something is written, earlier running steps are done.
      const settled = next.map((s) => (s.event.status === 'running' && e.status === 'ok' && s.key !== key ? { ...s, event: { ...s.event, status: 'ok' as const } } : s));
      return [...settled, { key, event: e, at }].slice(-24);
    });
  }), []);

  useEffect(() => {
    if (active) {
      setSteps([]); setPreview('idle'); setOpen(true);
      setStartedAt(Date.now()); setFinishedAt(null);
      const t = window.setInterval(() => setNow(Date.now()), 1000);
      return () => window.clearInterval(t);
    }
    setFinishedAt(Date.now());
    setSteps((prev) => prev.map((s) => (s.event.status === 'running' ? { ...s, event: { ...s.event, status: 'ok' } } : s)));
  }, [active]);

  useEffect(() => {
    listRef.current?.lastElementChild?.scrollIntoView({ block: 'nearest' });
  }, [steps.length]);

  if (!active && steps.length === 0 && preview === 'idle') return null;

  const seconds = startedAt ? Math.max(0, Math.round(((finishedAt ?? now) - startedAt) / 1000)) : 0;
  const files = steps.filter((s) => s.event.kind === 'file_change').length;

  return (
    <section aria-label="AI activity" className={cn('border-t border-border px-3 py-2 text-xs', className)}>
      <div className="flex items-center gap-2 text-muted-foreground">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex min-w-0 items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {active
            ? <Loader2 aria-hidden className="w-3.5 h-3.5 shrink-0 text-primary animate-spin motion-reduce:animate-none" />
            : <CheckCircle2 aria-hidden className="w-3.5 h-3.5 shrink-0 text-primary" />}
          <span role="status" aria-live="polite" className="truncate">
            {active ? `Working for ${seconds}s` : `Worked for ${seconds}s`}
            {files > 0 && ` · ${files} file${files === 1 ? '' : 's'}`}
          </span>
          <ChevronDown aria-hidden className={cn('w-3.5 h-3.5 shrink-0 transition-transform motion-reduce:transition-none', !open && '-rotate-90')} />
        </button>
        {preview !== 'idle' && (
          <span className={cn('ml-auto flex shrink-0 items-center gap-1', preview === 'failed' ? 'text-destructive' : preview === 'updated' ? 'text-primary' : 'text-muted-foreground')}>
            <Eye aria-hidden className="w-3.5 h-3.5" />
            {preview === 'updated' ? 'Preview updated' : preview === 'failed' ? 'Preview error' : 'Updating preview…'}
          </span>
        )}
      </div>
      {open && steps.length > 0 && (
        <ol ref={listRef} className="sleek-scrollbar mt-1 max-h-40 overflow-y-auto border-l border-border pl-3 ml-1.5 space-y-0.5">
          {steps.map(({ key, event }) => {
            const failed = event.status === 'failed' || event.kind === 'error';
            const running = active && event.status === 'running';
            const Icon = failed ? CircleAlert : running ? Loader2 : event.kind === 'file_change' ? FileCode : CheckCircle2;
            return (
              <li key={key} className="flex items-center gap-1.5 animate-in fade-in slide-in-from-bottom-1 duration-300 motion-reduce:animate-none">
                <Icon aria-hidden className={cn('w-3 h-3 shrink-0', failed ? 'text-destructive' : 'text-muted-foreground', running && 'animate-spin motion-reduce:animate-none')} />
                {event.kind === 'file_change' && event.path ? (
                  <button
                    type="button"
                    onClick={() => onOpenFile?.(event.path!)}
                    disabled={!onOpenFile}
                    title={`Open ${event.path}`}
                    className="flex min-w-0 items-center gap-1 text-foreground underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:no-underline"
                  >
                    <span className="text-muted-foreground">{/^Removing/.test(event.message) ? 'Removed' : 'Edited'}</span>
                    <span className="truncate font-mono">{shortName(event.path)}</span>
                    {event.added !== undefined && <span className="text-muted-foreground">+{event.added} −{event.removed ?? 0}</span>}
                  </button>
                ) : (
                  <span className={cn('truncate', failed ? 'text-destructive' : 'text-muted-foreground')}>{event.message}</span>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
