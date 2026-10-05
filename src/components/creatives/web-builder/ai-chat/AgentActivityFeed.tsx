import { useEffect, useState } from 'react';
import { CheckCircle2, CircleAlert, Loader2, Circle } from 'lucide-react';
import { onAgentEvent, type AgentEvent } from '@/services/agent-runtime/agentEvents';
import { cn } from '@/lib/utils';

const LABEL: Record<AgentEvent['kind'], string> = {
  understanding: 'Understanding',
  discovery: 'Found',
  plan: 'Plan',
  tool_call: 'Working',
  file_change: 'Editing',
  data_change: 'Data',
  verification: 'Checking',
  error: 'Problem',
  rollback: 'Rolled back',
  commit: 'Saved',
};

interface Props {
  active: boolean;
  className?: string;
}

/** Live, screen-reader friendly view of what the AI is doing right now. */
export function AgentActivityFeed({ active, className }: Props) {
  const [events, setEvents] = useState<Array<AgentEvent & { at: number }>>([]);

  useEffect(() => onAgentEvent((e, at) => {
    setEvents((prev) => [...prev.slice(-24), { ...e, at }]);
  }), []);

  useEffect(() => {
    if (active) setEvents([]);
  }, [active]);

  if (!active && events.length === 0) return null;
  const lastError = [...events].reverse().find((e) => e.kind === 'error' || e.status === 'failed');

  return (
    <section aria-label="AI activity" className={cn('py-2 text-sm', className)}>
      <ol role="log" aria-live="polite" aria-relevant="additions" className="space-y-1">
        {active && events.length === 0 && (
          <li className="flex items-center gap-2 text-muted-foreground">
            <Loader2 aria-hidden className="w-4 h-4 animate-spin motion-reduce:animate-none text-primary" />
            <span>Understanding your request…</span>
          </li>
        )}
        {events.map((e, i) => {
          const failed = e.status === 'failed' || e.kind === 'error';
          const running = e.status === 'running';
          const Icon = failed ? CircleAlert : running ? Loader2 : e.status === 'ok' || e.kind === 'commit' ? CheckCircle2 : Circle;
          return (
            <li key={`${e.at}-${i}`} className="flex items-start gap-2">
              <Icon
                aria-hidden
                className={cn(
                  'w-4 h-4 mt-0.5 shrink-0',
                  failed ? 'text-destructive' : 'text-primary',
                  running && 'animate-spin motion-reduce:animate-none',
                )}
              />
              <span className="min-w-0">
                <span className="font-medium text-foreground">{LABEL[e.kind]}: </span>
                <span className="text-muted-foreground break-words">{e.message}</span>
                {e.added !== undefined && (
                  <span className="ml-1 font-mono text-xs text-muted-foreground">+{e.added} −{e.removed ?? 0}</span>
                )}
              </span>
            </li>
          );
        })}
      </ol>
      {lastError && (
        <p role="alert" className="sr-only">{lastError.message}</p>
      )}
    </section>
  );
}
